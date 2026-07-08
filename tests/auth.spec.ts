import { test, expect } from '@playwright/test';
import { register, TEST_PASSWORD } from './test-utils';

test.describe('Authentifizierung: Registrierung, Anmeldung und Abmeldung', () => {
	test.beforeAll(async ({ browser }) => {
		const requestContext = await browser.newContext();
		await requestContext.request.post('/api/test/reset');
		await requestContext.close();
	});

	// Wir generieren einen zufälligen Nickname, um Kollisionen bei wiederholten Testläufen zu vermeiden
	const testNickname = `User_${Date.now()}`;
	const testPassword = 'SafePassword123!';

	test('sollte einen neuen User registrieren, sich an- und wieder abmelden können', async ({ page }) => {
		// 1. SCHRITT: Registrierung
		await register(page, testNickname, testPassword);

		// Verifikation des Logins: Wir prüfen ob wir auf der Startseite sind
		await expect(page).toHaveURL('/');

		// 2. SCHRITT: Logout
		// Der Logout-Button befindet sich im Header
		const logoutButton = page.getByRole('button', { name: 'Logout' });
		await expect(logoutButton).toBeVisible();
		await logoutButton.click();

		// Nach Logout sollte ein Reload den User-Status aktualisieren
		await page.reload();

		// Nach Logout sollten wir auf der Login-Seite landen
		await page.goto('/login');
		await expect(page).toHaveURL('/login');

		// Im Header sollten nun wieder "Anmelden" und "Registrieren" Links zu sehen sein
		await expect(page.getByRole('link', { name: 'Anmelden' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Registrieren', exact: true })).toBeVisible();

		// 3. SCHRITT: Login mit dem gerade erstellten User
		await page.goto('/login');
		await page.fill('input[name="nickname"]', testNickname);
		await page.fill('input[name="password"]', testPassword);
		await page.click('button[type="submit"]');

		// Verifizieren, dass wir wieder angemeldet sind
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('link', { name: testNickname })).toBeVisible();
	});

	test('Registrierung sollte bei ungleichen Passwörtern deaktiviert sein', async ({ page }) => {
		await page.goto('/registration');

		await page.fill('input[name="nickname"]', 'InvalidUser');
		await page.fill('input[name="password"]', 'password123');
		await page.fill('input[name="password2"]', 'different123');

		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toBeDisabled();
	});

	test('Login mit falschem Passwort zeigt eine Fehlermeldung', async ({ page }) => {
		const nickname = `WrongPassUser_${Date.now()}`;
		await register(page, nickname, 'CorrectPassword123!');

		// Abmelden, um den Login-Flow sauber zu testen
		const logoutResponse = page.waitForResponse(
			(resp) => resp.url().includes('/logout') && resp.request().method() === 'POST'
		);
		await page.getByRole('button', { name: 'Logout' }).click();
		await logoutResponse;
		await page.waitForURL(/\/login/);

		// Login mit falschem Passwort
		await page.goto('/login');
		await page.fill('input[name="nickname"]', nickname);
		await page.fill('input[name="password"]', 'WrongPassword999!');
		await page.click('button[type="submit"]');

		// Wir bleiben auf /login und sehen die Fehlermeldung
		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByText('Password invalid')).toBeVisible();
	});

	test('Registrierung mit bereits vergebenem Nickname zeigt eine Fehlermeldung', async ({ page, browser }) => {
		const nickname = `DupUser_${Date.now()}`;

		// Ersten User in eigenem Kontext anlegen
		const firstContext = await browser.newContext();
		const firstPage = await firstContext.newPage();
		await register(firstPage, nickname);
		await firstContext.close();

		// Zweite Registrierung mit demselben Nickname
		await page.goto('/registration');
		await page.fill('input[name="nickname"]', nickname);
		await page.fill('input[name="password"]', TEST_PASSWORD);
		await page.fill('input[name="password2"]', TEST_PASSWORD);
		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toBeEnabled();
		await submitButton.click();

		// Wir bleiben auf /registration und sehen die Fehlermeldung
		await expect(page).toHaveURL(/\/registration/);
		await expect(page.getByText('Invalid Nickname')).toBeVisible();
	});
});
