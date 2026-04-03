import { test, expect } from '@playwright/test';
import { register, getUserId } from './test-utils';

test.describe.serial('Profile Festivals Authorization', () => {
	const user1Nickname = `User1_${Date.now()}`;
	const user2Nickname = `User2_${Date.now()}`;
	const festivalName = `Friendship Festival ${Date.now()}`;

	let user1Context: any;
	let user1Page: any;
	let user1Id: string;

	let user2Context: any;
	let user2Page: any;
	let user2Id: string;

	test.beforeAll(async ({ browser }) => {
		// User 1 registrieren
		user1Context = await browser.newContext();
		user1Page = await user1Context.newPage();
		await register(user1Page, user1Nickname);
		user1Id = await getUserId(user1Page);

		// User 2 registrieren
		user2Context = await browser.newContext();
		user2Page = await user2Context.newPage();
		await register(user2Page, user2Nickname);
		user2Id = await getUserId(user2Page);
	});

	test.afterAll(async () => {
		await user1Context.close();
		await user2Context.close();
	});

	test('User 1 erstellt ein Festival und tritt bei', async () => {
		await user1Page.goto('/festival/new');
		await user1Page.fill('input[name="name"]', festivalName);
		await user1Page.fill('textarea[name="description"]', 'Test');
		await user1Page.fill('textarea[name="location"]', 'Test');
		await user1Page.fill('input[name="startDate"]', '2026-09-15');
		await user1Page.fill('input[name="startTime"]', '18:00');
		await Promise.all([user1Page.waitForURL(/\/festival\/[a-z0-9-]+$/), user1Page.click('button:has-text("Speichern")')]);

		const zusagenButton = user1Page.getByRole('button', { name: 'Zusagen' });
		await expect(zusagenButton).toBeVisible();
		
		await zusagenButton.click();
		const beitretenButton = user1Page.getByRole('button', { name: 'Beitreten' });
		await expect(beitretenButton).toBeVisible({ timeout: 10000 });
		await Promise.all([
			user1Page.waitForResponse(resp => resp.url().includes('/join') && resp.status() === 200),
			beitretenButton.click()
		]);
	});

	test('User 2 sollte die Festivals von User 1 NICHT sehen können (nicht befreundet)', async () => {
		// Direkt den API-Endpunkt aufrufen
		const response = await user2Page.request.get(`/user/${user1Id}/visiting-festivals`);
		expect(response.status()).toBe(403);
	});

	test('User 1 und User 2 werden Freunde', async () => {
		// User 2 sucht User 1 und schickt Anfrage
		await user2Page.goto(`/user/${user1Id}`);
		const addFriendButton = user2Page.getByRole('button', { name: 'Anfreunden' });
		await expect(addFriendButton).toBeVisible();
		
		await Promise.all([
			user2Page.waitForResponse(resp => resp.url().includes('/add-friend') && resp.status() === 200),
			addFriendButton.click()
		]);

		// User 1 nimmt an
		await user1Page.goto('/updates');
		const acceptButton = user1Page.getByRole('button', { name: 'Annehmen' }).first();
		await expect(acceptButton).toBeVisible();
		await Promise.all([
			user1Page.waitForResponse(resp => resp.url().includes('/accept-friend') && resp.status() === 200),
			acceptButton.click()
		]);
		await expect(acceptButton).not.toBeVisible();
	});

	test('User 2 sollte die Festivals von User 1 sehen können (jetzt befreundet)', async () => {
		const response = await user2Page.request.get(`/user/${user1Id}/visiting-festivals`);
		expect(response.status()).toBe(200);
		const json = await response.json();
		expect(json.length).toBeGreaterThan(0);
		expect(json[0].festivalName).toBe(festivalName);
	});
});
