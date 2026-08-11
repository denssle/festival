import { expect, test, type Page } from '@playwright/test';
import { register, logout } from './test-utils';

const PASSWORD = 'DeleteMePassword123!';

/** Öffnet den Lösch-Bereich und trägt das Passwort ein. */
async function openDeleteSection(page: Page, password: string): Promise<void> {
	await page.goto('/festival/settings');
	await page.locator('summary', { hasText: 'Konto löschen' }).click();
	await page.locator('input[name="deletePassword"]').fill(password);
}

const deleteForm = (page: Page) => page.locator('form[action="?/deleteAccount"]');
const confirmDialog = (page: Page) => page.locator('dialog:has-text("Konto endgültig löschen?")');

test.describe('Kontolöschung', () => {
	test.beforeAll(async ({ browser }) => {
		const requestContext = await browser.newContext();
		await requestContext.request.post('/festival/api/test/reset');
		await requestContext.close();
	});

	test('löscht das Konto nach Bestätigung und verhindert den erneuten Login', async ({ page }) => {
		const nickname = `Delete_User_${Date.now()}`;
		await register(page, nickname, PASSWORD);
		await openDeleteSection(page, PASSWORD);

		await deleteForm(page).locator('button[type="submit"]').click();

		const dialog = confirmDialog(page);
		await dialog.waitFor({ state: 'visible' });
		await dialog.locator('button', { hasText: 'Endgültig löschen' }).click();

		// Nach dem Löschen ist die Session weg – der Redirect führt auf die Anmeldung.
		await page.waitForURL('**/festival/login', { timeout: 15000 });

		// Der Login mit den alten Daten darf nicht mehr funktionieren.
		await page.fill('input[name="nickname"]', nickname);
		await page.fill('input[name="password"]', PASSWORD);
		await page.click('button[type="submit"]');
		await expect(page).not.toHaveURL('/festival/', { timeout: 15000 });
	});

	test('bricht beim Abbrechen im Dialog folgenlos ab', async ({ page }) => {
		const nickname = `Keep_User_${Date.now()}`;
		await register(page, nickname, PASSWORD);
		await openDeleteSection(page, PASSWORD);

		await deleteForm(page).locator('button[type="submit"]').click();

		const dialog = confirmDialog(page);
		await dialog.waitFor({ state: 'visible' });
		await dialog.locator('button', { hasText: 'Abbrechen' }).click();

		// Auf der Seite bleiben, Session intakt – und der Login funktioniert weiterhin.
		await expect(page).toHaveURL('/festival/settings');
		await logout(page);
		await page.fill('input[name="nickname"]', nickname);
		await page.fill('input[name="password"]', PASSWORD);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/festival/', { timeout: 15000 });
	});

	test('lehnt die Löschung bei falschem Passwort ab', async ({ page }) => {
		const nickname = `WrongPw_Delete_${Date.now()}`;
		await register(page, nickname, PASSWORD);
		await openDeleteSection(page, 'GanzFalschesPasswort999!');

		await deleteForm(page).locator('button[type="submit"]').click();

		const dialog = confirmDialog(page);
		await dialog.waitFor({ state: 'visible' });
		await dialog.locator('button', { hasText: 'Endgültig löschen' }).click();

		await expect(page.locator('span', { hasText: 'Current password is incorrect' })).toBeVisible({ timeout: 15000 });

		// Konto besteht weiter: Login mit den echten Daten geht noch.
		await logout(page);
		await page.fill('input[name="nickname"]', nickname);
		await page.fill('input[name="password"]', PASSWORD);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/festival/', { timeout: 15000 });
	});
});
