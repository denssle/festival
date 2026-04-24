import { test, expect } from '@playwright/test';
import { register, getUserId } from './test-utils';

test.describe.serial('Kommentar-Lifecycle', () => {
	const userANickname = `UserA_Comments_${Date.now()}`;
	const userBNickname = `UserB_Comments_${Date.now()}`;
	let userBId: string;
	let pageA: any;
	let pageB: any;
	let contextA: any;
	let contextB: any;
	const commentText = 'Hallo UserB, das ist ein Test-Kommentar von UserA!';
	const updatedCommentText = 'Hallo UserB, dieser Kommentar wurde bearbeitet!';

	test.beforeAll(async ({ browser }) => {
		contextA = await browser.newContext();
		contextB = await browser.newContext();
		pageA = await contextA.newPage();
		pageB = await contextB.newPage();

		// 1. Registrierung beider User
		await register(pageA, userANickname);
		await register(pageB, userBNickname);
		userBId = await getUserId(pageB);
	});

	test.afterAll(async () => {
		await contextA.close();
		await contextB.close();
	});

	test('User A sollte einen Kommentar auf dem Profil von User B erstellen', async () => {
		// User A navigiert zum Profil von User B
		await pageA.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		await expect(pageA.locator('h2')).toContainText(userBNickname);

		// User A schreibt einen Kommentar
		let textareaElement = pageA.locator('textarea[name="comment"]');
		await expect(textareaElement).toBeVisible();
		await textareaElement.fill(commentText);

		const responsePromise = pageA.waitForResponse((r: any) => r.url().includes('/user/') && r.status() === 200);
		await pageA.locator('button:has-text("Absenden")').click();
		await responsePromise;
		await pageA.waitForLoadState('networkidle');

		// Verifizieren, dass der Kommentar erscheint
		const commentLocator = pageA.locator('fieldset').filter({ hasText: commentText });
		await expect(commentLocator).toBeVisible({ timeout: 20000 });
		await expect(commentLocator).toContainText(userANickname);
	});

	test('User A sollte den Kommentar bearbeiten können', async () => {
		await pageA.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		await expect(pageA.locator('h2')).toContainText(userBNickname);

		const commentLocator = pageA.locator('fieldset').filter({ hasText: commentText });
		await expect(commentLocator).toBeVisible({ timeout: 10000 });

		let bearbeitenLocator = commentLocator.locator('button:has-text("Bearbeiten")');
		await expect(bearbeitenLocator).toBeVisible({ timeout: 10000 });
		await bearbeitenLocator.click();

		let textareaElement = pageA.locator('textarea[name="updateComment"]');
		let saveButton = pageA.locator('button:has-text("Speichern")');
		await expect(saveButton).toBeVisible();
		await expect(saveButton).not.toBeDisabled();
		await expect(textareaElement).toBeVisible();
		await textareaElement.fill(updatedCommentText);

		const responsePromise = pageA.waitForResponse((r: any) => r.url().includes('/user/') && r.status() === 200);
		await saveButton.click();
		await responsePromise;
		await pageA.waitForLoadState('networkidle');

		// Verifizieren der Änderung
		await expect(pageA.locator('fieldset', { hasText: updatedCommentText })).toBeVisible({ timeout: 10000 });
		await expect(pageA.locator('fieldset', { hasText: commentText })).not.toBeVisible();

		// Prüfen, dass der Edit-Mode beendet wurde (Speichern-Button weg)
		await expect(pageA.locator('button:has-text("Speichern")')).toBeDisabled();
	});

	test('User B sollte den bearbeiteten Kommentar sehen', async () => {
		await pageB.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		await expect(pageB.locator('fieldset').filter({ hasText: updatedCommentText })).toBeVisible({ timeout: 15000 });
	});

	test('User A sollte den Kommentar löschen können', async () => {
		await pageA.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		const updatedCommentLocator = pageA.locator('fieldset').filter({ hasText: updatedCommentText });
		await expect(updatedCommentLocator).toBeVisible({ timeout: 10000 });
		await updatedCommentLocator.locator('button:has-text("Löschen")').click();

		// Dialog bestätigen
		const dialog = pageA.locator('dialog').filter({ hasText: 'Ja' });
		await dialog.waitFor({ state: 'visible', timeout: 10000 });
		await dialog.locator('button:has-text("Ja")').click();
		await pageA.waitForLoadState('networkidle');

		// Verifizieren, dass der Kommentar weg ist
		await expect(pageA.locator('fieldset', { hasText: updatedCommentText })).not.toBeVisible({ timeout: 10000 });
	});

	test('User B sollte den gelöschten Kommentar nicht mehr sehen', async () => {
		await pageB.goto(`/user/${userBId}`, { waitUntil: 'networkidle' });
		await expect(pageB.locator('fieldset').filter({ hasText: updatedCommentText })).not.toBeVisible({ timeout: 15000 });
	});
});
