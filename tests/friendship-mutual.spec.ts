import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { register, getUserId, uniqueName, uiText, clickForResponse } from './test-utils';

/**
 * Fragen beide Seiten an, gilt die zweite Anfrage als Annahme. Vorher passierte dabei
 * nichts, der Knopf meldete aber „Anfrage gesendet“ (gefunden 2026-10-01).
 */
test.describe.serial('Gegenseitige Freundschaftsanfrage', () => {
	let contextA: BrowserContext;
	let contextB: BrowserContext;
	let pageA: Page;
	let pageB: Page;
	let userAId: string;
	let userBId: string;

	async function addFriend(page: Page, friendId: string): Promise<void> {
		await page.goto(`/festival/user/${friendId}`);
		await page.waitForLoadState('networkidle');
		await clickForResponse(page, page.getByTestId('friend-add'), '/add-friend');
	}

	test.beforeAll(async ({ browser }) => {
		contextA = await browser.newContext();
		contextB = await browser.newContext();
		pageA = await contextA.newPage();
		pageB = await contextB.newPage();
		await register(pageA, uniqueName('Anna'));
		await register(pageB, uniqueName('Ben'));
		userAId = await getUserId(pageA);
		userBId = await getUserId(pageB);
	});

	test.afterAll(async () => {
		await contextA.close();
		await contextB.close();
	});

	test('A fragt an', async () => {
		await addFriend(pageA, userBId);
		const dialog = pageA.getByTestId('info-dialog');
		await expect(dialog).toContainText(uiText('friend.requestSent'));
		await dialog.getByTestId('info-ok').click();
	});

	test('fragt A nochmal, heißt es: die andere Seite ist dran', async () => {
		await addFriend(pageA, userBId);
		const dialog = pageA.getByTestId('info-dialog');
		await expect(dialog).toContainText(uiText('friend.alreadyRequested'));
		await dialog.getByTestId('info-ok').click();
	});

	test('B klickt bei A auf „Anfreunden“ und nimmt damit an', async () => {
		await addFriend(pageB, userAId);
		const dialog = pageB.getByTestId('info-dialog');
		await expect(dialog).toContainText(uiText('friend.accepted'));
		await dialog.getByTestId('info-ok').click();

		// Nach dem Schließen lädt die Seite neu – jetzt als Freund
		await expect(pageB.getByTestId('friend-remove')).toBeVisible({ timeout: 15000 });
	});

	test('auch A sieht die Freundschaft, die Anfrage ist weg', async () => {
		await pageA.goto(`/festival/user/${userBId}`);
		await expect(pageA.getByTestId('friend-remove')).toBeVisible({ timeout: 15000 });

		await pageA.goto('/festival/updates');
		await pageA.waitForLoadState('networkidle');
		await expect(pageA.locator('.friend-request')).toHaveCount(0);
	});
});
