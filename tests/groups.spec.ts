import { test, expect } from '@playwright/test';
import { register, TEST_PASSWORD } from './test-utils';

test.describe.serial('Gruppen Management', () => {
	const timestamp = Date.now();
	const userNickname = `GroupUser_${timestamp}`;
	const groupName = `TestGruppe_${timestamp}`;
	const groupDescription = 'Dies ist eine Testbeschreibung für eine Gruppe.';

	test.beforeAll(async ({ browser }) => {
		const page = await browser.newPage();
		await register(page, userNickname, TEST_PASSWORD);
		await page.close();
	});

	test('sollte eine neue Gruppe anlegen können', async ({ page }) => {
		// Login
		await page.goto('/login');
		await page.fill('input[name="nickname"]', userNickname);
		await page.fill('input[name="password"]', TEST_PASSWORD);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/');

		// Zur Gruppenseite navigieren
		await page.goto('/group');
		await expect(page.getByText('Deine Gruppen')).toBeVisible();

		// Neue Gruppe anlegen
		await page.click('a[href="/group/new"]');
		await expect(page).toHaveURL('/group/new');

		await page.fill('input[name="name"]', groupName);
		await page.fill('textarea[name="description"]', groupDescription);
		await page.click('button[type="submit"]');

		// Redirect zurück zur Gruppenübersicht
		await expect(page).toHaveURL('/group');

		// Verifizieren, dass die Gruppe in der Liste erscheint
		await expect(page.getByText(groupName)).toBeVisible();
	});

	test('sollte anzeigen, dass man in keiner Gruppe ist (bei neuem User)', async ({ page }) => {
		const emptyUser = `EmptyGroupUser_${Date.now()}`;
		await register(page, emptyUser, TEST_PASSWORD);

		await page.goto('/group');
		await expect(page.getByText('Du bist in keiner Gruppe.')).toBeVisible();
	});
});
