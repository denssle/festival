import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { register, getUserId, uniqueName, clickForResponse } from './test-utils';

test.describe.serial('Freundschaftsprozess', () => {
	const userANickname = uniqueName('UserA');
	const userBNickname = uniqueName('UserB');
	let userAId: string;
	let userBId: string;
	let pageA: Page;
	let pageB: Page;
	let contextA: BrowserContext;
	let contextB: BrowserContext;

	test.beforeAll(async ({ browser }) => {
		const requestContext = await browser.newContext();
		await requestContext.request.post('/api/test/reset');
		await requestContext.close();

		contextA = await browser.newContext();
		contextB = await browser.newContext();
		pageA = await contextA.newPage();
		pageB = await contextB.newPage();

		// 1. Registrierung beider User
		await register(pageA, userANickname);
		await register(pageB, userBNickname);

		userAId = await getUserId(pageA);
		userBId = await getUserId(pageB);
	});

	test.afterAll(async () => {
		await contextA.close();
		await contextB.close();
	});

	test('User A sollte eine Freundschaftsanfrage an User B senden', async () => {
		await pageA.goto(`/user/${userBId}`);
		await expect(pageA.locator('h2')).toContainText(userBNickname);

		const addFriendButton = pageA.locator('button:has-text("Anfreunden")');
		await expect(addFriendButton).toBeVisible({ timeout: 10000 });

		await clickForResponse(pageA, addFriendButton, '/add-friend');

		// Warte auf das InfoDialog
		const dialog = pageA.locator('dialog').filter({ hasText: 'Freundschaftsanfrage wurde geschickt.' });
		await dialog.waitFor({ state: 'visible', timeout: 15000 });
		await dialog.locator('button:has-text("Okay")').click();
		await dialog.waitFor({ state: 'hidden', timeout: 10000 });
	});

	test('User B sollte die Freundschaftsanfrage annehmen', async () => {
		await pageB.goto('/updates', { waitUntil: 'networkidle' });

		// Warte auf das Element der Freundschaftsanfrage
		const requestLocator = pageB.locator('.friend-request').filter({ hasText: userANickname });
		await requestLocator.waitFor({ state: 'visible', timeout: 30000 });

		const acceptButton = requestLocator.locator('button:has-text("Annehmen")');
		await expect(acceptButton).toBeVisible({ timeout: 10000 });

		await clickForResponse(pageB, acceptButton, '/accept-friend');

		await expect(requestLocator).not.toBeVisible({ timeout: 15000 });
	});

	test('Freundschaft sollte auf beiden Profilen verifiziert werden', async () => {
		// Auf Profil B für User A
		await pageA.goto(`/user/${userBId}`);
		await pageA.reload(); // Force reload to bypass potential cache
		await pageA.waitForLoadState('load');

		// Warte, bis die Seite die Freundschaft geladen hat
		await expect(pageA.locator('button:has-text("Freund entfernen")')).toBeVisible({ timeout: 30000 });
		await expect(pageA.getByRole('article').getByRole('link', { name: userANickname })).toBeVisible({ timeout: 10000 });

		// Auf Profil A für User B
		await pageB.goto(`/user/${userAId}`);
		await pageB.reload(); // Force reload to bypass potential cache
		await pageB.waitForLoadState('load');
		await expect(pageB.locator('button:has-text("Freund entfernen")')).toBeVisible({ timeout: 30000 });
		await expect(pageB.getByRole('article').getByRole('link', { name: userBNickname })).toBeVisible({ timeout: 10000 });
	});

	test('User A sollte User B als Freund entfernen können', async () => {
		await pageA.goto(`/user/${userBId}`);
		await pageA.reload();
		await pageA.waitForLoadState('load');
		const removeFriendButton = pageA.locator('button:has-text("Freund entfernen")');
		await expect(removeFriendButton).toBeVisible({ timeout: 15000 });

		await clickForResponse(pageA, removeFriendButton, '/remove-friend');

		// Dialog schließen, der durch removeFriend() geöffnet wird
		const removeDialog = pageA.locator('dialog').filter({ hasText: 'Freundschaft gekündigt.' });
		await removeDialog.waitFor({ state: 'visible', timeout: 10000 });
		await removeDialog.locator('button:has-text("Okay")').click();
		await removeDialog.waitFor({ state: 'hidden', timeout: 10000 });

		await pageA.waitForLoadState('networkidle');
		await expect(pageA.locator('button:has-text("Anfreunden")')).toBeVisible({ timeout: 10000 });

		await pageB.goto(`/user/${userAId}`, { waitUntil: 'networkidle' });
		await expect(pageB).toHaveURL(`/user/${userAId}`, { timeout: 10000 });
		await expect(pageB.locator('button:has-text("Anfreunden")')).toBeVisible({ timeout: 15000 });
	});

	test('User A sollte eine Anfrage senden und wieder zurückziehen können', async () => {
		await pageA.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		const addFriendButton = pageA.locator('button:has-text("Anfreunden")');
		await expect(addFriendButton).toBeVisible({ timeout: 10000 });

		await clickForResponse(pageA, addFriendButton, '/add-friend');

		// Dialog schließen
		const dialog = pageA.locator('dialog').filter({ hasText: 'Freundschaftsanfrage wurde geschickt.' });
		await dialog.waitFor({ state: 'visible', timeout: 10000 });
		await dialog.locator('button:has-text("Okay")').click();
		await dialog.waitFor({ state: 'hidden', timeout: 10000 });

		await pageA.goto('/updates', { waitUntil: 'networkidle' });
		const cancelBtn = pageA
			.locator('.friend-request')
			.filter({ hasText: userBNickname })
			.locator('button:has-text("Zurückziehen")');
		await expect(cancelBtn).toBeVisible({ timeout: 10000 });

		await clickForResponse(pageA, cancelBtn, '/cancel-request');
		await expect(pageA.locator('.friend-request').filter({ hasText: userBNickname })).not.toBeVisible({
			timeout: 10000
		});
	});

	test('User A sollte eine Anfrage senden und User B diese ablehnen können', async () => {
		await pageA.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		const addFriendButton = pageA.locator('button:has-text("Anfreunden")');
		await expect(addFriendButton).toBeVisible({ timeout: 10000 });

		await clickForResponse(pageA, addFriendButton, '/add-friend');

		// Dialog schließen
		const dialog = pageA.locator('dialog').filter({ hasText: 'Freundschaftsanfrage wurde geschickt.' });
		await dialog.waitFor({ state: 'visible', timeout: 10000 });
		await dialog.locator('button:has-text("Okay")').click();

		await pageB.goto('/updates', { waitUntil: 'networkidle' });
		const declineBtn = pageB
			.locator('.friend-request')
			.filter({ hasText: userANickname })
			.locator('button:has-text("Ablehnen")');
		await expect(declineBtn).toBeVisible({ timeout: 10000 });

		await clickForResponse(pageB, declineBtn, '/decline-friend');
		await expect(pageB.locator('.friend-request').filter({ hasText: userANickname })).not.toBeVisible({
			timeout: 10000
		});
	});
});
