import { expect, test } from '@playwright/test';
import { BASE_PATH } from './test-utils';

/**
 * Sprachumschalter im Footer.
 *
 * Die Suite läuft laut `playwright.config.ts` fest auf `de-DE` – diese Spec ist damit
 * die einzige Stelle, an der die englische Fassung überhaupt zu sehen ist. Geprüft wird
 * neben dem Umschalten selbst zweierlei, das bei einem Refactoring lautlos wegfiele:
 * das `lang`-Attribut (hängt am `transformPageChunk` im `sprache`-Hook) und der
 * Rücksprung auf die Ausgangsseite (hängt an `safeRedirectTarget`).
 */
test.describe('Sprachumschalter', () => {
	const switcher = 'footer form.language-switcher';

	test('steht ohne Anmeldung im Footer', async ({ page }) => {
		await page.goto(`${BASE_PATH}/login`);

		await expect(page.locator(switcher)).toBeVisible();
		// Die aktive Sprache ist sichtbar, aber nicht klickbar.
		await expect(page.locator(`${switcher} button[value="de"]`)).toBeDisabled();
		await expect(page.locator(`${switcher} button[value="en"]`)).toBeEnabled();
	});

	test('stellt die Oberfläche auf Englisch und wieder zurück', async ({ page }) => {
		await page.goto(`${BASE_PATH}/login`);
		await expect(page.locator('header nav a', { hasText: 'Anmelden' })).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('lang', 'de');

		await page.locator(`${switcher} button[value="en"]`).click();
		await page.waitForURL(`**${BASE_PATH}/login`);

		await expect(page.locator('header nav a', { hasText: 'Sign in' })).toBeVisible();
		await expect(page.locator('footer nav a', { hasText: 'Privacy' })).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');

		await page.locator(`${switcher} button[value="de"]`).click();
		await page.waitForURL(`**${BASE_PATH}/login`);

		await expect(page.locator('header nav a', { hasText: 'Anmelden' })).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	});

	test('springt auf die Ausgangsseite zurück statt auf die Startseite', async ({ page }) => {
		await page.goto(`${BASE_PATH}/impressum`);

		await page.locator(`${switcher} button[value="en"]`).click();
		await page.waitForURL(`**${BASE_PATH}/impressum`);

		expect(new URL(page.url()).pathname).toBe(`${BASE_PATH}/impressum`);
	});

	test('behält die Sprache über einen Seitenwechsel hinweg', async ({ page }) => {
		await page.goto(`${BASE_PATH}/login`);
		await page.locator(`${switcher} button[value="en"]`).click();
		await page.waitForURL(`**${BASE_PATH}/login`);

		await page.goto(`${BASE_PATH}/registration`);

		// Der Cookie trägt die Wahl weiter, obwohl der Browser weiterhin `de-DE` sendet.
		await expect(page.locator('header nav a', { hasText: 'Sign up' })).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});

	test('übersetzt auch die Meldungen vom Server', async ({ page }) => {
		// Der Nachweis für Schritt 2: Die Meldung entsteht in einer Form-Action, nicht im
		// Markup. Sie wird serverseitig über `locals.locale` übersetzt – ohne das stünde
		// hier weiterhin der fest verdrahtete englische Text, unabhängig von der Sprache.
		await page.goto(`${BASE_PATH}/login`);
		await page.fill('input[name="nickname"]', 'GibtEsNicht_i18n');
		await page.fill('input[name="password"]', 'FalschesPasswort123!');
		await page.locator('article button[type="submit"]').click();
		await expect(page.getByText('Passwort ungültig.')).toBeVisible();

		await page.locator(`${switcher} button[value="en"]`).click();
		await page.waitForURL(`**${BASE_PATH}/login`);

		await page.fill('input[name="nickname"]', 'GibtEsNicht_i18n');
		await page.fill('input[name="password"]', 'FalschesPasswort123!');
		await page.locator('article button[type="submit"]').click();
		await expect(page.getByText('Invalid password.')).toBeVisible();
	});

	test('gilt auch auf der Wurzel unterhalb des Base-Pfads', async ({ page }) => {
		// Eigener Test, weil genau dieser Pfad die Stolperstelle ist: Der Cookie liegt auf
		// '/festival' (ohne Schrägstrich), gelesen wird er unter anderem auf '/festival/'.
		// Nach RFC 6265 passt das, SvelteKits Dev-Warnung legt aber das Gegenteil nahe –
		// sie stammt aus serverglobalem Zustand, der über Test-Kontexte hinweg stehenbleibt.
		await page.goto(`${BASE_PATH}/login`);
		await page.locator(`${switcher} button[value="en"]`).click();
		await page.waitForURL(`**${BASE_PATH}/login`);

		// Die Wurzel verlangt eine Anmeldung und leitet auf /login um – die Sprache muss
		// den Redirect überleben.
		await page.goto(`${BASE_PATH}/`);
		await page.waitForURL(`**${BASE_PATH}/login`);

		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
		await expect(page.locator('header nav a', { hasText: 'Sign in' })).toBeVisible();
	});
});
