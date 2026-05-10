import { test, expect } from '@playwright/test';
import { register } from './test-utils';

test.describe('Authentifizierung: Registrierung, Anmeldung und Abmeldung', () => {
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
});
