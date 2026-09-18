import { expect, test } from '@playwright/test';
import { register, uniqueName, UI_LOCALE } from './test-utils';
import { formatDateTime } from '../src/lib/utils/date.util';

/**
 * Startzeiten über den ganzen Weg: Eingabe -> Speichern (Server) -> Anzeige per SSR und
 * per Client-Navigation -> Bearbeiten-Formular -> erneut Speichern.
 *
 * Der Browser läuft bewusst in New York. Der Server läuft auf dem Entwicklungsrechner in
 * Berlin, in der CI in UTC. Die App soll trotzdem überall Berliner Zeit zeigen und
 * speichern (APP_TIME_ZONE) - hinge eine der Stationen an der Zeitzone ihrer Laufzeit,
 * liefe hier mindestens eine auseinander.
 *
 * 00:30 ist gewählt, weil genau diese Uhrzeit zwei alte Fehler traf: Die Stunde 0 wurde
 * beim Speichern verworfen, und das Bearbeiten-Formular zeigte den Vortag, weil es das
 * Datum in UTC las.
 */
test.use({ timezoneId: 'America/New_York' });

const DETAIL_URL = /\/festival\/festival\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

test('Startzeit kurz nach Mitternacht übersteht Anzeige und Bearbeiten', async ({ page }) => {
	await register(page, uniqueName('DateUser'));
	const festivalName: string = uniqueName('Mitternachtsfest');
	// 00:30 Berliner Sommerzeit = 22:30 UTC am Vortag.
	const expected: string = formatDateTime(new Date('2026-09-19T22:30:00.000Z'), UI_LOCALE, 'long');

	await page.goto('/festival/festival/new', { waitUntil: 'networkidle' });
	await page.fill('input[name="name"]', festivalName);
	await page.fill('input[name="startDate"]', '2026-09-20');
	await page.fill('input[name="startTime"]', '00:30');
	await Promise.all([page.waitForURL(DETAIL_URL), page.getByTestId('festival-save').click()]);
	const detailUrl: string = new URL(page.url()).pathname;

	// 1. Server-Rendering
	await expect(page.getByTestId('festival-start')).toContainText(expected);

	// 2. Client-Rendering: erst nach der Hydration klicken, sonst wäre es wieder SSR.
	await page.goto('/festival/', { waitUntil: 'networkidle' });
	await Promise.all([page.waitForURL(DETAIL_URL), page.getByRole('link', { name: festivalName }).click()]);
	await expect(page.getByTestId('festival-start')).toContainText(expected);

	// 3. Bearbeiten-Formular: Die Werte berechnet nach der Hydration der Browser (New York).
	await page.goto(`${detailUrl}/edit`, { waitUntil: 'networkidle' });
	await expect(page.locator('input[name="startDate"]')).toHaveValue('2026-09-20');
	await expect(page.locator('input[name="startTime"]')).toHaveValue('00:30');

	// 4. Unverändert speichern darf nichts verschieben.
	await Promise.all([page.waitForURL(DETAIL_URL), page.getByTestId('festival-save').click()]);
	await expect(page.getByTestId('festival-start')).toContainText(expected);
});
