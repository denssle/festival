import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { register, getUserId, uniqueName, uiText } from './test-utils';
import { MAX_LONG_TEXT_LENGTH as MAX } from '../src/lib/services/text-length.logic';

/**
 * Einheitliche Fehlerbehandlung im Browser (`request()` in src/lib/utils/request.ts):
 * Fehler kommen beim Nutzer an – mit der Meldung des Servers, bei Netzwerkfehlern mit
 * einem eigenen Text – statt still zu verpuffen.
 */
test.describe.serial('Fehlermeldungen im Browser', () => {
	let context: BrowserContext;
	let page: Page;
	let userId: string;

	test.beforeAll(async ({ browser }) => {
		context = await browser.newContext();
		page = await context.newPage();
		await register(page, uniqueName('Fehler'));
		userId = await getUserId(page);
	});

	test.afterAll(async () => {
		await context.close();
	});

	async function writeComment(text: string): Promise<void> {
		await page.goto(`/festival/user/${userId}`);
		await page.waitForLoadState('networkidle');
		const textarea = page.locator('textarea[name="comment"]');
		await expect(async () => {
			await textarea.fill(text);
			await expect(textarea).toHaveValue(text, { timeout: 500 });
		}).toPass({ timeout: 10000 });
		await page.getByTestId('comment-submit').click();
	}

	test('ein abgelehnter Kommentar zeigt die Meldung des Servers und behält den Text', async () => {
		const text = uniqueName('Kommentar');
		await page.route('**/comments', (route) =>
			route.request().method() === 'POST'
				? route.fulfill({ status: 422, json: { message: 'Meldung vom Server' } })
				: route.continue()
		);

		await writeComment(text);

		const dialog = page.getByTestId('comment-error-dialog');
		await dialog.waitFor({ state: 'visible' });
		await expect(dialog).toContainText('Meldung vom Server');
		await expect(page.locator('textarea[name="comment"]')).toHaveValue(text);
		await expect(page.locator('fieldset', { hasText: text })).toHaveCount(0);

		await dialog.getByTestId('info-ok').click();
		await page.unroute('**/comments');
	});

	test('ohne Verbindung kommt eine eigene Meldung', async () => {
		await page.route('**/comments', (route) =>
			route.request().method() === 'POST' ? route.abort('internetdisconnected') : route.continue()
		);

		await writeComment(uniqueName('Offline'));

		const dialog = page.getByTestId('comment-error-dialog');
		await dialog.waitFor({ state: 'visible' });
		await expect(dialog).toContainText(uiText('error.network'));

		await dialog.getByTestId('info-ok').click();
		await page.unroute('**/comments');
	});

	test('der Server antwortet mit JSON und übersetzter Meldung', async () => {
		await page.goto(`/festival/user/${userId}`);
		// page.evaluate läuft im Browser – die Länge muss als Argument mit.
		const result = await page.evaluate(
			async ({ url, length }: { url: string; length: number }) => {
				const body = new FormData();
				body.append('comment', 'x'.repeat(length));
				const response = await fetch(url, { method: 'POST', body });
				return { status: response.status, body: await response.json() };
			},
			{ url: `/festival/user/${userId}/comments`, length: MAX + 1 }
		);

		expect(result).toEqual({ status: 422, body: { message: uiText('error.inputTooLong', { max: MAX }) } });
	});

	test('ohne Freundschaft sagt das Profil, warum keine Zusagen zu sehen sind', async ({ browser }) => {
		const stranger = await browser.newContext();
		const strangerPage = await stranger.newPage();
		await register(strangerPage, uniqueName('Fremd'));

		await strangerPage.goto(`/festival/user/${userId}`);
		await expect(strangerPage.getByTestId('visiting-festivals-error')).toHaveText(
			uiText('profile.visiting.onlyFriends')
		);
		await stranger.close();
	});
});
