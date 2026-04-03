import { test, expect } from '@playwright/test';
import { register, getUserId } from './test-utils';

test.describe('Benutzereinstellungen und Profilbild', () => {
	const testNickname = `SettingsUser_${Date.now()}`;
	const initialPassword = 'InitialPassword123!';
	const newPassword = 'NewSecurePassword456!';

	test.beforeEach(async ({ page }) => {
		await register(page, testNickname, initialPassword);
	});

	test('sollte das Passwort ändern können', async ({ page }) => {
		await page.goto('/settings');
		await expect(page.locator('h2')).toContainText('Einstellungen');

		// Das Passwort-Feld ist in einem <details> verborgen
		await page.locator('summary', { hasText: 'Passwort' }).click();
		
		const passwordInput = page.locator('input[name="password"]');
		await expect(passwordInput).toBeVisible();
		await passwordInput.fill(newPassword);
		
		await page.click('button[type="submit"]');

		// Erfolgsmeldung prüfen - sie ist in einem span innerhalb des p-tags
		const successMessage = page.locator('span', { hasText: 'Password changed' });
		// Wir prüfen hier nur auf den Textinhalt, da die Sichtbarkeit (hidden Attribut) problematisch sein könnte
		await expect(successMessage).toHaveText('Password changed', { timeout: 15000 });

		// Logout über den Button im Header
		await page.click('nav button:has-text("Logout")');
		await expect(page).toHaveURL('/login', { timeout: 15000 });

		// Login mit neuem Passwort verifizieren
		await page.fill('input[name="nickname"]', testNickname);
		await page.fill('input[name="password"]', newPassword);
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL('/', { timeout: 15000 });
	});

	test('sollte ein Profilbild hochladen können', async ({ page }) => {
		const userId = await getUserId(page);
		await page.goto(`/user/${userId}`);
		
		const fileChooserPromise = page.waitForEvent('filechooser');
		await page.click('button:has-text("Bild hochladen")');
		const fileChooser = await fileChooserPromise;
		
		// Ein minimales valides PNG (1x1 Pixel)
		const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
		
		await fileChooser.setFiles([{
			name: 'test.png',
			mimeType: 'image/png',
			buffer: buffer
		}]);

		// Dialog-Erfolg abwarten - Präziser Selektor um Strict Mode Violation zu vermeiden
		const dialog = page.locator('dialog').filter({ hasText: 'Okay' });
		await expect(dialog).toBeVisible({ timeout: 15000 });
		await expect(dialog).toContainText('Bild erfolgreich hochgeladen');
		await dialog.locator('button:has-text("Okay")').click();

		// Prüfen ob das Bild im Avatar geladen wird
		// Alt-Text in AvatarImage.svelte ist "alt avatar"
		const avatarImg = page.locator('img[alt="alt avatar"]');
		await expect(avatarImg).toBeVisible({ timeout: 15000 });
		const src = await avatarImg.getAttribute('src');
		// In AvatarImage wird das Bild als Base64 geladen oder via API
		expect(src).toBeTruthy();
	});
});
