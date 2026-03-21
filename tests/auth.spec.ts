import { test, expect } from '@playwright/test';

test.describe('Authentifizierung: Registrierung und Anmeldung', () => {
	// Wir generieren einen zufälligen Nickname, um Kollisionen bei wiederholten Testläufen zu vermeiden
	const testNickname = `User_${Math.floor(Math.random() * 1000000)}`;
	const testPassword = 'SafePassword123!';

	test('sollte einen neuen User registrieren und sich danach anmelden können', async ({ page }) => {
		// 1. SCHRITT: Registrierung
		await page.goto('/registration');
		
		// Prüfen ob wir auf der richtigen Seite sind
		await expect(page.locator('h2')).toContainText('Registration');

		// Formular ausfüllen
		await page.fill('input[name="nickname"]', testNickname);
		await page.fill('input[name="password"]', testPassword);
		await page.fill('input[name="password2"]', testPassword);

		// Registrierung absenden
		// Der Button ist nur aktiv, wenn die Passwörter übereinstimmen
		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toBeEnabled();
		await submitButton.click();

		// Nach erfolgreicher Registrierung erfolgt laut +page.server.ts eine automatische Session-Erstellung
		// und eine Weiterleitung auf die Startseite (/)
		await expect(page).toHaveURL('/');

		// Verifikation des Logins: Wir prüfen ob wir auf der Startseite sind und nicht mehr auf /registration
		await expect(page).not.toHaveURL('/registration');
		
		// Optional: Wir könnten prüfen, ob wir zur Profilseite navigieren können
		// Da wir den Nickname kennen, sollte /user/[nickname] existieren
		await page.goto(`/user/${testNickname}`);
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
