import { test, expect, type Locator, type Page, type Response } from '@playwright/test';
import { register, getUserId, logout } from './test-utils';

/**
 * Die Einstellungsseite trägt zwei Formulare (Passwort ändern, Konto löschen), jedes
 * mit eigenem <details> und eigenem Submit-Button. Ohne Eingrenzung laufen Locators
 * wie `button[type="submit"]` in eine Strict-mode-Verletzung.
 */
function passwordForm(page: Page): Locator {
	return page.locator('form[action="?/changePassword"]');
}

test.describe('Benutzereinstellungen und Profilbild', () => {
	test.beforeAll(async ({ browser }) => {
		const requestContext = await browser.newContext();
		await requestContext.request.post('/festival/api/test/reset');
		await requestContext.close();
	});

	test('sollte das Passwort ändern können', async ({ page }) => {
		const testNickname = `Password_User_${Date.now()}`;
		const initialPassword = 'InitialPassword123!';
		const newPassword = 'NewSecurePassword456!';
		await register(page, testNickname, initialPassword);
		await page.goto('/festival/settings');
		await expect(page.locator('h2')).toContainText('Einstellungen');

		// Das Passwort-Feld ist in einem <details> verborgen
		await page.locator('summary', { hasText: 'Passwort' }).click();

		const currentPasswordInput = page.locator('input[name="currentPassword"]');
		await expect(currentPasswordInput).toBeVisible();
		await currentPasswordInput.fill(initialPassword);
		await page.locator('input[name="password"]').fill(newPassword);
		await page.locator('input[name="passwordRepeat"]').fill(newPassword);

		// Klick auf Speichern und warten auf Antwort. Locator aufs Passwort-Formular
		// eingegrenzt: die Seite trägt seit v0.7.41 zusätzlich das Lösch-Formular
		// mit eigenem <details> und eigenem Submit-Button.
		const responsePromise = page.waitForResponse((r: Response) => r.url().includes('/settings') && r.status() === 200);
		await passwordForm(page).locator('button[type="submit"]').click();
		await responsePromise;
		await page.waitForLoadState('networkidle');

		// Das <details> muss eventuell wieder geöffnet werden, falls es nach Reload geschlossen ist
		const summary = page.locator('summary', { hasText: 'Passwort' });
		const details = passwordForm(page).locator('details');
		const isOpen = await details.evaluate((node) => (node as HTMLDetailsElement).open);
		if (!isOpen) {
			await summary.click();
		}

		// Erfolgsmeldung prüfen - sie ist in einem span innerhalb des p-tags
		const successMessage = page.locator('span', { hasText: 'Password changed' });
		await expect(successMessage).toBeVisible({ timeout: 15000 });

		// Logout über den Button im Header (retry-fest gegen Hydration-Race)
		await logout(page);

		// Login mit neuem Passwort verifizieren
		await page.fill('input[name="nickname"]', testNickname);
		await page.fill('input[name="password"]', newPassword);
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL('/festival/', { timeout: 15000 });
	});

	test('sollte die Passwortänderung bei falschem aktuellen Passwort ablehnen', async ({ page }) => {
		const testNickname = `WrongPass_User_${Date.now()}`;
		const initialPassword = 'InitialPassword123!';
		await register(page, testNickname, initialPassword);
		await page.goto('/festival/settings');
		await page.locator('summary', { hasText: 'Passwort' }).click();

		await page.locator('input[name="currentPassword"]').fill('FalschesPasswort999!');
		await page.locator('input[name="password"]').fill('NewSecurePassword456!');
		await page.locator('input[name="passwordRepeat"]').fill('NewSecurePassword456!');

		const responsePromise = page.waitForResponse((r: Response) => r.url().includes('/settings') && r.status() === 200);
		await passwordForm(page).locator('button[type="submit"]').click();
		await responsePromise;
		await page.waitForLoadState('networkidle');

		const details = passwordForm(page).locator('details');
		if (!(await details.evaluate((node) => (node as HTMLDetailsElement).open))) {
			await page.locator('summary', { hasText: 'Passwort' }).click();
		}
		await expect(page.locator('span', { hasText: 'Current password is incorrect' })).toBeVisible({ timeout: 15000 });

		// Login mit dem ALTEN Passwort muss weiterhin funktionieren
		await logout(page);
		await page.fill('input[name="nickname"]', testNickname);
		await page.fill('input[name="password"]', initialPassword);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/festival/', { timeout: 15000 });
	});

	test('sollte ein Profilbild hochladen können', async ({ page }) => {
		await register(page, `Profilbild_User_${Date.now()}`, 'InitialPassword123!');
		const userId = await getUserId(page);
		await page.goto(`/festival/user/${userId}`);
		await expect(page).toHaveURL(`/festival/user/${userId}`, { timeout: 15000 });

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
				(r: Response) => r.url().includes('/user-image') && r.request().method() === 'POST',
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
		await expect(page).toHaveURL(`/festival/user/${userId}`, { timeout: 15000 });

		// Prüfen ob das Bild im Avatar geladen wird
		// Alt-Text in AvatarImage.svelte ist "alt avatar"
		const avatarImg = page.locator('img[alt="alt avatar"]');
		await expect(avatarImg).toBeVisible({ timeout: 15000 });
		const src = await avatarImg.getAttribute('src');
		// In AvatarImage wird das Bild als Base64 geladen oder via API
		expect(src).toBeTruthy();
	});

	test('sollte einen serverseitig ungültigen Upload ablehnen', async ({ page }) => {
		await register(page, `BadUpload_User_${Date.now()}`, 'InitialPassword123!');

		// Direkt gegen den Endpoint (umgeht die clientseitige Prüfung in AvatarUpload.svelte).
		// page.evaluate -> Browser sendet seine Session-Cookies mit.
		const results = await page.evaluate(async () => {
			const post = (body: string) => fetch('/festival/user-image', { method: 'POST', body }).then((r) => r.status);
			return {
				wrongType: await post('data:image/gif;base64,R0lGODlhAQABAAAAACw='),
				tooBig: await post('data:image/png;base64,' + 'A'.repeat(1_500_000)),
				malformed: await post('kein-data-uri')
			};
		});

		expect(results.wrongType).toBe(415);
		expect(results.tooBig).toBe(413);
		expect(results.malformed).toBe(400);
	});

	test('sollte Avatare mit Cache-Headern ausliefern und bei passendem ETag 304 antworten', async ({ page }) => {
		await register(page, `Cache_User_${Date.now()}`, 'InitialPassword123!');
		const userId = await getUserId(page);
		const imageUrl = `/festival/user-image/${userId}`;

		// Ohne hinterlegtes Bild: 204, aber ebenfalls cachebar (der häufigste Fall).
		const withoutImage = await page.request.get(imageUrl);
		expect(withoutImage.status()).toBe(204);
		expect(withoutImage.headers()['cache-control']).toContain('private');

		// Bild direkt über den Endpoint hinterlegen (umgeht den Datei-Dialog).
		const uploadStatus = await page.evaluate(
			async () =>
				(
					await fetch('/festival/user-image', {
						method: 'POST',
						body:
							'data:image/png;base64,' +
							'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
					})
				).status
		);
		expect(uploadStatus).toBe(200);

		// Mit Bild: 200 samt ETag. page.request nutzt den Browser-Cache NICHT – die Antworten
		// kommen also garantiert vom Server, das bedingte Request stellen wir selbst.
		const withImage = await page.request.get(imageUrl);
		expect(withImage.status()).toBe(200);
		const etag = withImage.headers()['etag'];
		expect(etag).toBeTruthy();
		expect(withImage.headers()['cache-control']).toContain('max-age');

		// Gleicher ETag -> 304 ohne Bilddaten
		const revalidated = await page.request.get(imageUrl, { headers: { 'If-None-Match': etag } });
		expect(revalidated.status()).toBe(304);
		expect((await revalidated.body()).length).toBe(0);

		// Fremder ETag -> volle Antwort
		const stale = await page.request.get(imageUrl, { headers: { 'If-None-Match': '"veraltet"' } });
		expect(stale.status()).toBe(200);
	});
});
