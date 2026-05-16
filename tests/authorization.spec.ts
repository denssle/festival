import { test, expect, type Response } from '@playwright/test';
import { register, getUserId, uniqueName } from './test-utils';

test.describe.serial('Profile Festivals Authorization', () => {
	const user1Nickname = uniqueName('User1');
	const user2Nickname = uniqueName('User2');
	const festivalName = uniqueName('Festival');

	let user1Context: any;
	let user1Page: any;
	let user1Id: string;
	let festivalId: string;

	let user2Context: any;
	let user2Page: any;

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
		await Promise.all([
			user1Page.waitForURL(/\/festival\/[a-z0-9-]+$/),
			user1Page.click('button:has-text("Speichern")')
		]);
		await user1Page.waitForLoadState('networkidle');
		const url = user1Page.url();
		const parts = url.split('/');
		festivalId = parts[parts.length - 1];

		const zusagenButton = user1Page.getByRole('button', { name: 'Zusagen' });
		await expect(zusagenButton).toBeVisible({ timeout: 10000 });
		await zusagenButton.click();

		const dialog = user1Page.locator('dialog:has-text("Bei dem Event bin ich dabei!")');
		await dialog.waitFor({ state: 'visible', timeout: 15000 });
		await Promise.all([
			user1Page.waitForResponse((resp: Response) => resp.url().includes('/join') && resp.status() === 200),
			dialog.locator('button:has-text("Beitreten")').click()
		]);
	});

	test('User 2 sollte die Festivals von User 1 NICHT sehen können (nicht befreundet)', async () => {
		// Direkt den API-Endpunkt aufrufen
		const response = await user2Page.request.get(`/user/${user1Id}/visiting-festivals`);
		expect(response.status()).toBe(403);
	});

	test('User 2 sollte das Festival von User 1 NICHT löschen können', async () => {
		await user2Page.goto('/');
		const status = await user2Page.evaluate(async (id: string) => {
			const resp = await fetch(`/festival/${id}`, { method: 'DELETE' });
			return resp.status;
		}, festivalId);
		expect(status).toBe(403);
	});

	test('User 1 und User 2 werden Freunde', async () => {
		// User 2 sucht User 1 und schickt Anfrage
		await user2Page.goto(`/user/${user1Id}`);
		await user2Page.waitForLoadState('networkidle');
		const addFriendButton = user2Page.getByRole('button', { name: 'Anfreunden' });
		await expect(addFriendButton).toBeVisible({ timeout: 10000 });

		const responsePromise = user2Page.waitForResponse(
			(resp: Response) => resp.url().includes('/add-friend') && resp.status() === 200,
			{ timeout: 15000 }
		);
		await addFriendButton.click();
		await responsePromise;

		// User 1 nimmt an
		await user1Page.goto('/updates');
		await user1Page.waitForLoadState('networkidle');
		const acceptButton = user1Page.getByRole('button', { name: 'Annehmen' }).first();
		await expect(acceptButton).toBeVisible({ timeout: 15000 });

		// Klick und warten auf Response
		await Promise.all([
			user1Page.waitForResponse((resp: Response) => resp.url().includes('/accept-friend') && resp.status() === 200, {
				timeout: 15000
			}),
			acceptButton.click()
		]);

		// Sicherstellen, dass das Element aus dem DOM entfernt wird
		await expect(acceptButton).not.toBeVisible({ timeout: 15000 });
		await user1Page.waitForLoadState('networkidle');
		
		// Warte kurz, um sicherzugehen, dass DB sync fertig ist
		await user1Page.waitForTimeout(1000); 
	});

	test('User 2 sollte die Festivals von User 1 sehen können (jetzt befreundet)', async () => {
		await user2Page.waitForLoadState('networkidle');
		const response = await user2Page.request.get(`/user/${user1Id}/visiting-festivals`);
		expect(response.status()).toBe(200);
		const json = await response.json();
		expect(json.length).toBeGreaterThan(0);
		expect(json[0].festivalName).toBe(festivalName);
	});
});
