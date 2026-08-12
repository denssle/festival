import { expect, test } from '@playwright/test';
import { BASE_PATH } from './test-utils';

/**
 * Impressum und Datenschutzerklärung sind Pflichtseiten: Sie müssen ohne Anmeldung
 * erreichbar und aus dem Footer heraus auffindbar sein. Zusätzlich abgesichert:
 * die Obfuskation der E-Mail-Adresse im Impressum – sie hängt an einem
 * clientseitigen `onMount` und würde bei einem Refactoring lautlos wegfallen.
 */
test.describe('Rechtliche Seiten', () => {
	test('sind ohne Anmeldung erreichbar', async ({ page }) => {
		await page.goto(`${BASE_PATH}/impressum`);
		await expect(page.getByRole('heading', { name: 'Impressum' })).toBeVisible();

		await page.goto(`${BASE_PATH}/datenschutz`);
		await expect(page.getByRole('heading', { name: 'Datenschutzerklärung' })).toBeVisible();
	});

	test('sind aus dem Footer verlinkt', async ({ page }) => {
		await page.goto(`${BASE_PATH}/login`);

		await page.locator('footer nav a', { hasText: 'Datenschutz' }).click();
		await page.waitForURL(`**${BASE_PATH}/datenschutz`);

		await page.locator('footer nav a', { hasText: 'Impressum' }).click();
		await page.waitForURL(`**${BASE_PATH}/impressum`);
	});

	test('Impressum nennt die Pflichtangaben als Text', async ({ page }) => {
		await page.goto(`${BASE_PATH}/impressum`);

		const address = page.locator('address');
		await expect(address).toContainText('Dominik Hellweg');
		await expect(address).toContainText('Preinstraße 116');
		await expect(address).toContainText('44265 Dortmund');
	});

	test('E-Mail steht nicht im ausgelieferten HTML, wird aber im Browser zum mailto-Link', async ({ page }) => {
		const response = await page.goto(`${BASE_PATH}/impressum`);
		const serverHtml = (await response?.text()) ?? '';

		// Serverseitig darf die Adresse nur in umschriebener Form auftauchen.
		expect(serverHtml).not.toContain('dominik.hellweg@protonmail.com');
		expect(serverHtml).toContain('dominik.hellweg (at) protonmail.com');

		// Nach der Hydration steht ein echter, klickbarer mailto-Link da.
		await expect(page.locator('address a[href="mailto:dominik.hellweg@protonmail.com"]')).toHaveText(
			'dominik.hellweg@protonmail.com'
		);
	});
});
