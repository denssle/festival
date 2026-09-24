import { test, expect } from '@playwright/test';
import { register, getUserId, uniqueName, uiText } from './test-utils';

/**
 * Längengrenzen für Texteingaben (text-length.logic.ts).
 *
 * Die Suite läuft auf SQLite, das VARCHAR(255) nicht erzwingt – ohne serverseitige
 * Prüfung gingen überlange Texte hier durch und scheiterten erst in Produktion
 * (MariaDB: "Data too long" → 500). Getestet wird deshalb die Prüfung selbst, am
 * `maxlength` der Formulare vorbei.
 */
test.describe('Längengrenzen für Texteingaben', () => {
	test('Kommentar: 5000 Zeichen gehen durch, 5001 werden mit 422 abgelehnt', async ({ page }) => {
		await register(page, uniqueName('Length_Comment'));
		const userId = await getUserId(page);

		// page.evaluate -> Browser sendet seine Session-Cookies mit.
		const statuses = await page.evaluate(async (id) => {
			const post = (length: number) => {
				const body = new FormData();
				body.set('comment', 'x'.repeat(length));
				return fetch(`/festival/user/${id}/comments`, { method: 'POST', body }).then((r) => r.status);
			};
			return { atLimit: await post(5000), overLimit: await post(5001) };
		}, userId);

		expect(statuses).toEqual({ atLimit: 200, overLimit: 422 });
	});

	test('Festival: zu langer Name zeigt eine Fehlermeldung statt eines Serverfehlers', async ({ page }) => {
		await register(page, uniqueName('Length_Festival'));
		await page.goto('/festival/festival/new');
		await page.waitForLoadState('networkidle');

		const nameInput = page.locator('input[name="name"]');
		await expect(nameInput).toHaveAttribute('maxlength', '255');
		// maxlength begrenzt nur Tastatureingaben (fill() inklusive) – ein per Script
		// gesetzter Wert geht ungekürzt raus, wie bei einem manipulierten Request.
		await nameInput.evaluate((input: HTMLInputElement) => (input.value = 'n'.repeat(256)));
		await page.getByTestId('festival-save').click();

		await expect(page.locator('p.error')).toHaveText(uiText('error.inputTooLong', { max: 255 }));
		await expect(page).toHaveURL('/festival/festival/new');
	});
});
