import { test, expect } from '@playwright/test';
import { register, getUserId } from './test-utils';

test.describe.serial('Profile Festivals Display', () => {
	const userNickname = `FestivalUser_${Date.now()}`;
	const festivalName = `Unique Festival ${Date.now()}`;

	let page: any;
	let context: any;
	let userId: string;

	test.beforeAll(async ({ browser }) => {
		const requestContext = await browser.newContext();
		await requestContext.request.post('/api/test/reset');
		await requestContext.close();

		context = await browser.newContext();
		page = await context.newPage();
		await register(page, userNickname);
		userId = await getUserId(page);
	});

	test.afterAll(async () => {
		await context.close();
	});

	test('sollte ein Festival anlegen und beitreten', async () => {
		// 1. Festival erstellen
		await page.goto('/festival/new');
		await page.fill('input[name="name"]', festivalName);
		await page.fill('textarea[name="description"]', 'Test');
		await page.fill('textarea[name="location"]', 'Test');
		await page.fill('input[name="startDate"]', '2026-09-15');
		await page.fill('input[name="startTime"]', '18:00');

		await Promise.all([page.waitForURL(/\/festival\/[a-z0-9-]+$/), page.click('button:has-text("Speichern")')]);
		await page.waitForLoadState('networkidle');

		// 2. Beitreten (Zusagen)
		const zusagenButton = page.getByRole('button', { name: 'Zusagen' });
		await expect(zusagenButton).toBeVisible({ timeout: 10000 });
		await zusagenButton.click();

		const dialog = page.locator('dialog:has-text("Bei dem Event bin ich dabei!")');
		await dialog.waitFor({ state: 'visible', timeout: 10000 });

		await dialog.locator('#food').fill('Pasta');
		await dialog.locator('button:has-text("Beitreten")').click();
		await expect(dialog).not.toBeVisible({ timeout: 10000 });
	});

	test('sollte das Festival nur einmal im Profil anzeigen', async () => {
		// Zum Profil navigieren und auf den visiting-festivals fetch warten
		const festivalsResponse = page.waitForResponse(
			(r: any) => r.url().includes('/visiting-festivals') && r.request().method() === 'GET'
		);
		await page.goto(`/user/${userId}`);
		await festivalsResponse;

		// Sektion "Festivals" finden
		const festivalsSection = page.locator('section').filter({ has: page.locator('h4', { hasText: 'Festivals:' }) });
		await expect(festivalsSection).toBeVisible();

		// Liste der angemeldeten Festivals prüfen
		const festivalLinks = festivalsSection.locator('ul li a');

		// Warten bis Daten geladen sind (VisitingFestivals.svelte nutzt fetch)
		// Wir prüfen hier auf genau 1, auch wenn technisch mehrere GuestInfos existieren könnten
		await expect(festivalLinks).toHaveCount(1, { timeout: 10000 });
		await expect(festivalLinks.first()).toHaveText(festivalName);
	});
});
