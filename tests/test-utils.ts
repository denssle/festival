import { expect, type Locator, type Page } from '@playwright/test';

export const TEST_PASSWORD = 'TestPassword123!';

/**
 * Klickt einen Trigger-Button und stellt sicher, dass der zugehörige Dialog sichtbar wird.
 *
 * Hintergrund: SvelteKit rendert den Button serverseitig; er ist bereits klickbar, bevor bei
 * der Hydration der `onclick`-Handler angehängt ist. Unter voller Suite-Last (langsamere
 * Hydration) kann ein Klick daher "verloren" gehen und der Dialog öffnet nie. `toPass`
 * wiederholt den Klick, bis der Dialog erscheint. Ist der Dialog bereits offen, wird nicht
 * erneut geklickt (verhindert das versehentliche Schließen bzw. Klicks gegen das Modal-Overlay).
 */
export async function openDialog(trigger: Locator, dialog: Locator): Promise<void> {
	await expect(async () => {
		if (!(await dialog.isVisible())) {
			await trigger.click({ timeout: 3000 });
		}
		await expect(dialog).toBeVisible({ timeout: 2000 });
	}).toPass({ timeout: 25000 });
}

/**
 * Klickt einen Button, der clientseitig einen `fetch` auslöst, und wartet auf die passende Response.
 *
 * Gleiche Hydration-Race wie bei {@link openDialog}: Geht der erste Klick verloren (Handler noch
 * nicht angehängt), startet gar kein Request. Der Klick wird daher wiederholt, bis der Request
 * tatsächlich **startet**. Danach wird auf die Response gewartet. Das Warten auf den Request-START
 * (statt die Response) verhindert Doppel-Requests: Sobald ein Request läuft, wird nicht erneut
 * geklickt – ein verlorener Klick löst dagegen nie einen Request aus.
 *
 * @param urlIncludes Teilstring, den die Request-URL enthalten muss (z. B. '/remove-friend')
 * @param method HTTP-Methode (Default 'POST')
 */
export async function clickForResponse(
	page: Page,
	trigger: Locator,
	urlIncludes: string,
	method = 'POST'
): Promise<void> {
	const responsePromise = page.waitForResponse(
		(r) => r.url().includes(urlIncludes) && r.request().method() === method,
		{ timeout: 30000 }
	);
	await expect(async () => {
		const requestStarted = page.waitForRequest((r) => r.url().includes(urlIncludes) && r.method() === method, {
			timeout: 3000
		});
		await trigger.click({ timeout: 3000 });
		await requestStarted;
	}).toPass({ timeout: 25000 });
	await responsePromise;
}

export const uniqueName = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

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
	await page.waitForTimeout(500);

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
 * Meldet den aktuellen Benutzer über den Logout-Button im Header ab.
 *
 * Gleiche Hydration-Race wie bei {@link openDialog}: Der Logout-Button ist serverseitig
 * gerendert und klickbar, bevor sein Handler angehängt ist – unter Suite-Last geht der
 * erste Klick verloren und die Navigation nach /login kommt nie. Der Klick wird daher
 * wiederholt, bis die Login-Seite erreicht ist.
 */
export async function logout(page: Page): Promise<void> {
	const logoutButton = page.getByRole('button', { name: 'Logout' });
	await expect(logoutButton).toBeVisible({ timeout: 10000 });
	await expect(async () => {
		if (!page.url().includes('/login')) {
			await logoutButton.click({ timeout: 3000 });
		}
		await page.waitForURL('/login', { timeout: 3000 });
	}).toPass({ timeout: 25000 });
	await page.waitForLoadState('networkidle');
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
