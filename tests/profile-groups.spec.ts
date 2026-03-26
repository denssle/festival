import { test, expect } from '@playwright/test';
import { register, getUserId } from './test-utils';

test.describe.serial('Profil Gruppen Anzeige', () => {
	const timestamp = Date.now();
	const userNickname = `GroupProfileUser_${timestamp}`;
	const groupName = `ProfileTestGruppe_${timestamp}`;

	test('sollte erstellte Gruppen im Profil anzeigen', async ({ page }) => {
		// 1. Registrieren
		await register(page, userNickname);
		const userId = await getUserId(page);

		// 2. Gruppe anlegen
		await page.goto('/group/new');
		await page.fill('input[name="name"]', groupName);
		await page.fill('textarea[name="description"]', 'Eine Testgruppe für das Profil.');
		await page.click('button[type="submit"]');

		// Redirect zur Gruppenseite prüfen
		await expect(page).toHaveURL(/\/group\/[0-9a-f-]+/);

		// 3. Zum Profil navigieren
		await page.goto(`/user/${userId}`);

		// 4. Prüfen, ob die Gruppe in der neuen Sektion angezeigt wird
		const groupsSection = page.locator('section:has(h4:text("Gruppen:"))');
		await expect(groupsSection).toBeVisible();

		const groupLink = groupsSection.locator(`a:text("${groupName}")`);
		await expect(groupLink).toBeVisible();

		// 5. Link prüfen
		const href = await groupLink.getAttribute('href');
		expect(href).toMatch(/\/group\/[0-9a-f-]+/);
	});

	test('sollte anzeigen, wenn keine Gruppen vorhanden sind', async ({ page }) => {
		const newUser = `NoGroupUser_${Date.now()}`;
		await register(page, newUser);
		const userId = await getUserId(page);

		await page.goto(`/user/${userId}`);

		const groupsSection = page.locator('section:has(h4:text("Gruppen:"))');
		await expect(groupsSection).toBeVisible();
		await expect(groupsSection).toContainText('Du bist in keiner Gruppe.');
	});
});
