import { expect, type Page } from '@playwright/test';

export const TEST_PASSWORD = 'TestPassword123!';

/**
 * Registriert einen neuen Benutzer.
 * @param page Die Playwright-Page.
 * @param nickname Der gewünschte Nickname.
 * @param password Das Passwort (optional, nutzt Standard falls nicht angegeben).
 */
export async function register(page: Page, nickname: string, password = TEST_PASSWORD) {
	await page.goto('/registration');
	await page.fill('input[name="nickname"]', nickname);
	await page.fill('input[name="password"]', password);
	await page.fill('input[name="password2"]', password);

	const submitButton = page.locator('button[type="submit"]');
	await expect(submitButton).toBeEnabled();

	await submitButton.click();

	await expect(page).toHaveURL('/', { timeout: 15000 });

	// Sicherstellen, dass die Session im Header reflektiert wird (Hydration / Login-Status)
	await expect(page.locator('header nav a[href^="/user/"]')).toBeVisible({ timeout: 10000 });
	console.log(`Registered user: ${nickname}`);
}

/**
 * Extrahiert die User-ID aus dem Profil-Link im Header.
 * @param page Die Playwright-Page.
 * @returns Die extrahierte ID.
 */
export async function getUserId(page: Page): Promise<string> {
	const profileLink = page.locator('header nav a[href^="/user/"]');
	// Sicherstellen, dass der Link da ist, bevor wir das Attribut lesen
	await expect(profileLink).toBeVisible({ timeout: 10000 });
	const href = await profileLink.getAttribute('href');
	const id = href?.split('/').pop() || '';
	console.log(`Extracted ID for profile link: ${id}`);
	return id;
}

/**
 * Meldet einen Benutzer an.
 * @param page Die Playwright-Page.
 * @param nickname Der Nickname des Benutzers.
 * @param password Das Passwort.
 */
export async function login(page: Page, nickname: string, password = TEST_PASSWORD) {
	await page.goto('/login');
	await page.fill('input[name="nickname"]', nickname);
	await page.fill('input[name="password"]', password);
	const submitButton = page.locator('button[type="submit"]');
	await Promise.all([page.waitForURL('/', { timeout: 15000 }), submitButton.click()]);

	// Sicherstellen, dass der Login erfolgreich war (Redirect zur Home-Seite)
	await expect(page.locator('header nav a[href^="/user/"]')).toBeVisible({ timeout: 10000 });
	console.log(`Logged in user: ${nickname}`);
}
