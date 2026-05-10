import { test, expect } from '@playwright/test';
import { register, getUserId } from './test-utils';

test.describe.serial('Freundschaftsprozess', () => {
	const userANickname = `UserA_${Date.now()}`;
	const userBNickname = `UserB_${Date.now()}`;
	let userAId: string;
	let userBId: string;
	let pageA: any;
	let pageB: any;
	let contextA: any;
	let contextB: any;

	test.beforeAll(async ({ browser }) => {
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
		await pageA.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		await expect(pageA.locator('h2')).toContainText(userBNickname);

		const addFriendButton = pageA.locator('button:has-text("Anfreunden")');
		await expect(addFriendButton).toBeVisible({ timeout: 10000 });

		const [response] = await Promise.all([
			pageA.waitForResponse((resp: any) => resp.url().includes('/add-friend') && resp.status() === 200, {
				timeout: 30000
			}),
			addFriendButton.click()
		]);
		await pageA.waitForLoadState('networkidle');
	});

	test('User B sollte die Freundschaftsanfrage annehmen', async () => {
		await pageB.goto('/updates', { waitUntil: 'networkidle' });
		
		// Warte auf das Element der Freundschaftsanfrage
		const requestLocator = pageB.locator(`.friend-request:has-text("${userANickname}")`);
		await requestLocator.waitFor({ state: 'visible', timeout: 20000 });
		
		const acceptButton = requestLocator.locator('button:has-text("Annehmen")');
		await expect(acceptButton).toBeVisible({ timeout: 10000 });
		
		const responsePromise = pageB.waitForResponse(
			(resp: any) => resp.url().includes('/accept-friend') && resp.status() === 200,
			{ timeout: 15000 }
		);
		await acceptButton.click();
		await responsePromise;
		
		await pageB.waitForLoadState('networkidle');
		await expect(requestLocator).not.toBeVisible({ timeout: 10000 });
	});

	test('Freundschaft sollte auf beiden Profilen verifiziert werden', async () => {
		// Auf Profil B für User A
		await pageA.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		await pageA.reload(); // Force reload to bypass potential cache
		await pageA.waitForLoadState('networkidle');

		// Warte, bis die Seite die Freundschaft geladen hat
		await expect(pageA.locator('button:has-text("Freund entfernen")')).toBeVisible({ timeout: 15000 });
		await expect(pageA.locator('section:has-text("Freunde:")')).toContainText(userANickname);

		// Auf Profil A für User B
		await pageB.goto(`/user/${userAId}`, { waitUntil: 'networkidle' });
		await pageB.reload(); // Force reload to bypass potential cache
		await pageB.waitForLoadState('networkidle');
		await expect(pageB.locator('button:has-text("Freund entfernen")')).toBeVisible({ timeout: 15000 });
	});

	test('User A sollte User B als Freund entfernen können', async () => {
		await pageA.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		await pageA.reload();
		await pageA.waitForLoadState('networkidle');
		const removeFriendButton = pageA.locator('button:has-text("Freund entfernen")');
		await expect(removeFriendButton).toBeVisible({ timeout: 15000 });
		
		const responsePromise = pageA.waitForResponse(
			(resp: any) => resp.url().includes('/remove-friend') && resp.status() === 200,
			{ timeout: 15000 }
		);
		await removeFriendButton.click();
		await responsePromise;

		await pageA.waitForLoadState('networkidle');
		await pageA.reload();
		await pageA.waitForLoadState('networkidle');
		await expect(pageA.locator('button:has-text("Anfreunden")')).toBeVisible({ timeout: 10000 });

		await pageB.goto(`/user/${userAId}`, { waitUntil: 'networkidle' });
		await pageB.reload();
		await pageB.waitForLoadState('networkidle');
		await expect(pageB.locator('button:has-text("Anfreunden")')).toBeVisible({ timeout: 10000 });
	});

	test('User A sollte eine Anfrage senden und wieder zurückziehen können', async () => {
		await pageA.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		const addFriendButton = pageA.locator('button:has-text("Anfreunden")');
		await expect(addFriendButton).toBeVisible({ timeout: 10000 });
		
		const responsePromise = pageA.waitForResponse(
			(resp: any) => resp.url().includes('/add-friend') && resp.status() === 200,
			{ timeout: 30000 }
		);
		await addFriendButton.click();
		await responsePromise;
		await pageA.waitForLoadState('networkidle');

		await pageA.goto('/updates', { waitUntil: 'networkidle' });
		const cancelBtn = pageA.locator(`.friend-request:has-text("${userBNickname}") button:has-text("Zurückziehen")`);
		await expect(cancelBtn).toBeVisible({ timeout: 10000 });
		
		const responsePromise2 = pageA.waitForResponse(
			(resp: any) => resp.url().includes('/cancel-friend-request') && resp.status() === 200,
			{ timeout: 15000 }
		);
		await cancelBtn.click();
		await responsePromise2;
		
		await pageA.waitForLoadState('networkidle');
		await expect(pageA.locator(`.friend-request:has-text("${userBNickname}")`)).not.toBeVisible({ timeout: 10000 });
	});

	test('User A sollte eine Anfrage senden und User B diese ablehnen können', async () => {
		await pageA.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		const addFriendButton = pageA.locator('button:has-text("Anfreunden")');
		await expect(addFriendButton).toBeVisible({ timeout: 10000 });
		
		const responsePromise = pageA.waitForResponse(
			(resp: any) => resp.url().includes('/add-friend') && resp.status() === 200,
			{ timeout: 30000 }
		);
		await addFriendButton.click();
		await responsePromise;
		await pageA.waitForLoadState('networkidle');

		await pageB.goto('/updates', { waitUntil: 'networkidle' });
		const declineBtn = pageB.locator(`.friend-request:has-text("${userANickname}") button:has-text("Ablehnen")`);
		await expect(declineBtn).toBeVisible({ timeout: 10000 });
		
		const responsePromise2 = pageB.waitForResponse(
			(resp: any) => resp.url().includes('/reject-friend') && resp.status() === 200,
			{ timeout: 15000 }
		);
		await declineBtn.click();
		await responsePromise2;
		
		await pageB.waitForLoadState('networkidle');
		await expect(pageB.locator(`.friend-request:has-text("${userANickname}")`)).not.toBeVisible({ timeout: 10000 });
	});
});
