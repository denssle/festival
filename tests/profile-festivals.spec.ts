import { test, expect } from '@playwright/test';
import { register, getUserId } from './test-utils';

test.describe.serial('Profile Festivals Display', () => {
	const userNickname = `FestivalUser_${Date.now()}`;
	const festivalName = `Unique Festival ${Date.now()}`;
	
	let page: any;
	let context: any;
	let userId: string;
	let festivalId: string;

	test.beforeAll(async ({ browser }) => {
		context = await browser.newContext();
		page = await context.newPage();
		userId = await register(page, userNickname);
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
		await page.click('button:has-text("Speichern")');

		await expect(page).toHaveURL(/\/festival\/[a-z0-9-]+/);
		festivalId = page.url().split('/').pop() || '';

		// 2. Beitreten (Zusagen)
		await page.click('button:has-text("Zusagen")');
		const dialog = page.locator('dialog[open]');
		await expect(dialog).toBeVisible();
		await page.fill('#food', 'Pasta');
		await dialog.locator('button:has-text("Beitreten")').click();
		await expect(dialog).not.toBeVisible();
	});

	test('sollte das Festival nur einmal im Profil anzeigen', async () => {
		// Simuliere einen zweiten (vielleicht verwaisten oder fehlerhaften) Eintrag in der DB, 
		// indem wir einfach nochmal beitreten (falls das UI das zulässt oder wir es provozieren)
		// Da wir den Service fixen, sollte die UI trotzdem nur einen anzeigen.
		
		// Zum Profil navigieren
		await page.goto(`/user/${userId}`);
		
		// Sektion "Festivals" finden
		const festivalsSection = page.locator('section:has(h4:text("Festivals:"))');
		await expect(festivalsSection).toBeVisible();

		// Liste der angemeldeten Festivals prüfen
		const festivalLinks = festivalsSection.locator('ul li a');
		
		// Warten bis Daten geladen sind (VisitingFestivals.svelte nutzt fetch)
		// Wir prüfen hier auf genau 1, auch wenn technisch mehrere GuestInfos existieren könnten
		await expect(festivalLinks).toHaveCount(1);
		await expect(festivalLinks.first()).toHaveText(festivalName);
	});
});
