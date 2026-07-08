import { test, expect } from '@playwright/test';
import { register, getUserId } from './test-utils';

test.describe('Benutzereinstellungen und Profilbild', () => {
	test.beforeAll(async ({ browser }) => {
		const requestContext = await browser.newContext();
		await requestContext.request.post('/api/test/reset');
		await requestContext.close();
	});

	test('sollte das Passwort ändern können', async ({ page }) => {
		const testNickname = `Password_User_${Date.now()}`;
		const initialPassword = 'InitialPassword123!';
		const newPassword = 'NewSecurePassword456!';
		await register(page, testNickname, initialPassword);
		await page.goto('/settings');
		await expect(page.locator('h2')).toContainText('Einstellungen');

		// Das Passwort-Feld ist in einem <details> verborgen
		await page.locator('summary', { hasText: 'Passwort' }).click();

		const passwordInput = page.locator('input[name="password"]');
		await expect(passwordInput).toBeVisible();
		await passwordInput.fill(newPassword);

		// Klick auf Speichern und warten auf Antwort
		const responsePromise = page.waitForResponse((r: any) => r.url().includes('/settings') && r.status() === 200);
		await page.click('button[type="submit"]');
		await responsePromise;
		await page.waitForLoadState('networkidle');

		// Das <details> muss eventuell wieder geöffnet werden, falls es nach Reload geschlossen ist
		const summary = page.locator('summary', { hasText: 'Passwort' });
		const details = page.locator('details');
		const isOpen = await details.evaluate((node) => (node as HTMLDetailsElement).open);
		if (!isOpen) {
			await summary.click();
		}

		// Erfolgsmeldung prüfen - sie ist in einem span innerhalb des p-tags
		const successMessage = page.locator('span', { hasText: 'Password changed' });
		await expect(successMessage).toBeVisible({ timeout: 15000 });

		// Logout über den Button im Header
		await page.click('nav button:has-text("Logout")');
		await page.waitForURL('/login', { timeout: 15000 });

		// Login mit neuem Passwort verifizieren
		await page.fill('input[name="nickname"]', testNickname);
		await page.fill('input[name="password"]', newPassword);
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL('/', { timeout: 15000 });
	});

	test('sollte ein Profilbild hochladen können', async ({ page }) => {
		await register(page, `Profilbild_User_${Date.now()}`, 'InitialPassword123!');
		const userId = await getUserId(page);
		await page.goto(`/user/${userId}`);
		await expect(page).toHaveURL(`/user/${userId}`, { timeout: 15000 });

		// Ein minimales valides PNG (1x1 Pixel)
		const buffer = Buffer.from(
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
			'base64'
		);

		// Das <input type="file"> ist per display:none versteckt und wird per JS .click() ausgelöst.
		// Playwright's filechooser-Event funktioniert nicht bei programmatischem .click().
		// Stattdessen direkt setInputFiles() auf dem versteckten Input verwenden.
		//
		// Robust gegen Hydration-Race: Der onchange-Handler des Inputs wird erst bei der
		// Hydration angehängt. Unter voller Suite-Last kann setInputFiles feuern, bevor der
		// Handler da ist -> kein POST. Daher erneut setzen, bis der Upload-Request rausgeht.
		const fileInput = page.locator('input[type="file"]');
		await expect(async () => {
			const uploadResponse = page.waitForResponse(
				(r: any) => r.url().includes('/user-image') && r.request().method() === 'POST',
				{ timeout: 3000 }
			);
			await fileInput.setInputFiles([
				{
					name: 'test.png',
					mimeType: 'image/png',
					buffer: buffer
				}
			]);
			await uploadResponse;
		}).toPass({ timeout: 30000 });

		// Dialog-Erfolg abwarten - Präziser Selektor um Strict Mode Violation zu vermeiden
		const dialog = page.locator('dialog').filter({ hasText: 'Okay' });
		await dialog.waitFor({ state: 'visible', timeout: 15000 });
		await expect(dialog).toContainText('Bild erfolgreich hochgeladen');
		await dialog.locator('button:has-text("Okay")').click();

		// Sicherstellen, dass wir noch auf der User-Profilseite sind (und nicht redirected wurden)
		await expect(page).toHaveURL(`/user/${userId}`, { timeout: 15000 });

		// Prüfen ob das Bild im Avatar geladen wird
		// Alt-Text in AvatarImage.svelte ist "alt avatar"
		const avatarImg = page.locator('img[alt="alt avatar"]');
		await expect(avatarImg).toBeVisible({ timeout: 15000 });
		const src = await avatarImg.getAttribute('src');
		// In AvatarImage wird das Bild als Base64 geladen oder via API
		expect(src).toBeTruthy();
	});
});
