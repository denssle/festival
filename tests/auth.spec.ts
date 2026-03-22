import { test, expect } from '@playwright/test';
import { register } from './test-utils';

test.describe('Authentifizierung: Registrierung und Anmeldung', () => {
	// Wir generieren einen zufälligen Nickname, um Kollisionen bei wiederholten Testläufen zu vermeiden
	const testNickname = `User_${Date.now()}`;
	const testPassword = 'SafePassword123!';

	test('sollte einen neuen User registrieren und sich danach anmelden können', async ({ page }) => {
		// 1. SCHRITT: Registrierung
		await register(page, testNickname, testPassword);

		// Verifikation des Logins: Wir prüfen ob wir auf der Startseite sind
		await expect(page).toHaveURL('/');

		// Optional: Wir könnten prüfen, ob wir zur Profilseite navigieren können
		// Da wir nun angemeldet sind, sollte im Header ein Link zum Profil mit der User-ID vorhanden sein
		const profileLink = page.locator(`header nav a[href^="/user/"]`);
		await expect(profileLink).toBeVisible();
		await profileLink.click();

		// Verifizieren, dass wir auf der Profilseite sind und der Nickname angezeigt wird
		await expect(page).toHaveURL(/\/user\/.+/);
		await expect(page.locator('h2')).toContainText(testNickname);
	});

	test('sollte sich mit einem existierenden User anmelden können', async ({ page }) => {
		// Wir nutzen einen statischen Test-User für den Login-Check
		// In einer realen CI/CD Pipeline würde man diesen vorher in die DB inserten
		const loginUser = 'TestUser';
		const loginPass = 'TestPassword123';

		await page.goto('/login');
		await expect(page.locator('h2')).toContainText('Anmeldung');

		await page.fill('input[name="nickname"]', loginUser);
		await page.fill('input[name="password"]', loginPass);
		await page.click('button[type="submit"]');

		// Nach Login Weiterleitung auf /
		await expect(page).toHaveURL('/');
		await expect(page).not.toHaveURL('/login');
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
