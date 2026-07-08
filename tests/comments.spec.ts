import { test, expect } from '@playwright/test';
import { register, getUserId, uniqueName, openDialog, clickForResponse } from './test-utils';

test.describe.serial('Kommentar-Lifecycle', () => {
	const userANickname = uniqueName('UserA_Comments');
	const userBNickname = uniqueName('UserB_Comments');
	let userBId: string;
	let pageA: any;
	let pageB: any;
	let contextA: any;
	let contextB: any;
	const commentText = 'Hallo UserB, das ist ein Test-Kommentar von UserA!';
	const updatedCommentText = 'Hallo UserB, dieser Kommentar wurde bearbeitet!';

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
		userBId = await getUserId(pageB);
	});

	test.afterAll(async () => {
		await contextA.close();
		await contextB.close();
	});

	test('User A sollte einen Kommentar auf dem Profil von User B erstellen', async () => {
		// User A navigiert zum Profil von User B
		await pageA.goto(`/user/${userBId}`);
		await expect(pageA.locator('h2')).toContainText(userBNickname);

		// User A schreibt einen Kommentar
		let textareaElement = pageA.locator('textarea[name="comment"]');
		await expect(textareaElement).toBeVisible();
		await textareaElement.fill(commentText);

		await clickForResponse(pageA, pageA.locator('button:has-text("Absenden")'), '/comments', 'POST');

		// Verifizieren, dass der Kommentar erscheint
		const commentLocator = pageA.locator('fieldset').filter({ hasText: commentText });
		await expect(commentLocator).toBeVisible({ timeout: 20000 });
		await expect(commentLocator).toContainText(userANickname);
	});

	test('User A sollte den Kommentar bearbeiten können', async () => {
		await pageA.goto(`/user/${userBId}`);
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

		await clickForResponse(pageA, saveButton, '/comments', 'PUT');

		// Verifizieren der Änderung
		await expect(pageA.locator('fieldset', { hasText: updatedCommentText })).toBeVisible({ timeout: 10000 });
		await expect(pageA.locator('fieldset', { hasText: commentText })).not.toBeVisible();

		// Prüfen, dass der Edit-Mode beendet wurde (Speichern-Button weg)
		await expect(pageA.locator('button:has-text("Speichern")')).toBeDisabled();
	});

	test('User B sollte den bearbeiteten Kommentar sehen', async () => {
		await pageB.goto(`/user/${userBId}`);
		await expect(pageB.locator('fieldset').filter({ hasText: updatedCommentText })).toBeVisible({ timeout: 15000 });
	});

	test('User A sollte den Kommentar löschen können', async () => {
		await pageA.goto(`/user/${userBId}`);
		const updatedCommentLocator = pageA.locator('fieldset').filter({ hasText: updatedCommentText });
		await expect(updatedCommentLocator).toBeVisible({ timeout: 10000 });

		const deleteResponse = pageA.waitForResponse(
			(r: any) => r.url().includes('/comments') && r.request().method() === 'DELETE'
		);

		// Löschen-Button öffnet Bestätigungsdialog (robust gegen Hydration-Race)
		const dialog = pageA.locator('dialog').filter({ hasText: 'Kommentar löschen' });
		await openDialog(updatedCommentLocator.locator('button:has-text("Löschen")'), dialog);
		const reloadResponse = pageA.waitForResponse(
			(r: any) => r.url().includes('/comments') && r.request().method() === 'GET'
		);
		await dialog.locator('button:has-text("Ja")').click();
		await deleteResponse;
		await reloadResponse;

		// Verifizieren, dass der Kommentar weg ist
		await expect(pageA.locator('fieldset', { hasText: updatedCommentText })).not.toBeVisible({ timeout: 10000 });
	});

	test('User B sollte den gelöschten Kommentar nicht mehr sehen', async () => {
		await pageB.goto(`/user/${userBId}`);
		await expect(pageB.locator('fieldset').filter({ hasText: updatedCommentText })).not.toBeVisible({ timeout: 15000 });
	});
});
