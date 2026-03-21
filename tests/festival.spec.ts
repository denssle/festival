import { test, expect } from '@playwright/test';
import { register, getUserId } from './test-utils';

test.describe.serial('Festival-Management Lifecycle', () => {
	const userNickname = `FestivalCreator_${Date.now()}`;
	const festivalName = `Mein Super Festival ${Date.now()}`;
	const updatedFestivalName = `Bearbeitetes Festival ${Date.now()}`;
	
	let page: any;
	let context: any;
	let festivalId: string;

	test.beforeAll(async ({ browser }) => {
		context = await browser.newContext();
		page = await context.newPage();
		await register(page, userNickname);
	});

	test.afterAll(async () => {
		await context.close();
	});

	test('sollte ein neues Festival anlegen können', async () => {
		await page.goto('/festival/new');
		await expect(page.locator('h2')).toContainText('Neue Veranstaltung anlegen');

		await page.fill('input[name="name"]', festivalName);
		await page.fill('textarea[name="description"]', 'Dies ist eine Test-Beschreibung für unser Festival.');
		await page.fill('textarea[name="location"]', 'Test-Ort im Grünen');
		
		// Datum setzen (Format hängt vom Browser ab, aber Playwright's fill für type="date" erwartet YYYY-MM-DD)
		await page.fill('input[name="startDate"]', '2026-08-15');
		await page.fill('input[name="startTime"]', '18:00');

		await page.check('input[name="bringYourOwnFood"]');
		await page.check('input[name="bringYourOwnBottle"]');

		// Absenden
		await page.click('button:has-text("Speichern")');

		// Verifizieren: Redirect auf /festival/[id]
		await expect(page).toHaveURL(/\/festival\/[a-z0-9-]+/);
		await expect(page.getByRole('heading', { level: 4, name: festivalName })).toBeVisible();
		
		// ID extrahieren für spätere Tests (optional, da wir page.url() nutzen können)
		festivalId = page.url().split('/').pop() || '';
	});

	test('sollte das Festival bearbeiten können', async () => {
		// Wir sind bereits auf der Detailseite, klicken auf Bearbeiten
		await page.click('button:has-text("Bearbeiten")');
		await expect(page).toHaveURL(/\/festival\/.*\/edit/);

		await page.fill('input[name="name"]', updatedFestivalName);
		await page.uncheck('input[name="bringYourOwnFood"]');
		
		await page.click('button:has-text("Speichern")');

		// Zurück auf Detailseite
		await expect(page).toHaveURL(/\/festival\/[a-z0-9-]+/);
		await expect(page.getByRole('heading', { level: 4, name: updatedFestivalName })).toBeVisible();
		
		// Checkbox sollte nun deaktiviert und unchecked sein (disabled da Read-only auf Detailseite)
		const foodCheckbox = page.locator('input[name="bringYourOwnFood"]');
		await expect(foodCheckbox).not.toBeChecked();
	});

	test('sollte zu einem Festival zusagen können', async () => {
		await page.goto(`/festival/${festivalId}`);
		await expect(page.getByRole('heading', { level: 4, name: updatedFestivalName })).toBeVisible();

		// Zusagen Button klicken
		await page.click('button:has-text("Zusagen")');

		// Dialog sollte erscheinen
		const dialog = page.locator('dialog[open]');
		await expect(dialog).toBeVisible();
		await expect(dialog).toContainText('Bei dem Event bin ich dabei!');

		// Felder ausfüllen (Verwende IDs statt Name, da in JoinEventDialog.svelte IDs genutzt werden)
		await page.fill('#food', 'Pizza');
		await page.fill('#drink', 'Bier');
		await page.fill('#otherGuests', '2');

		// Bestätigen (Button Label ist "Beitreten" laut JoinEventDialog.svelte)
		await dialog.locator('button:has-text("Beitreten")').click();

		// Warten bis Dialog schließt
		await expect(dialog).not.toBeVisible();

		// In der Tabelle "Besucher die kommen" prüfen
		const comingTable = page.locator('table').first(); // ComingVisitorsTable
		await expect(comingTable).toContainText(userNickname);
		await expect(comingTable).toContainText('Pizza');
		await expect(comingTable).toContainText('Bier');
	});

	test('sollte das Festival löschen können', async () => {
		await page.goto(`/festival/${festivalId}`);
		await page.click('button:has-text("Löschen")');

		// Dialog bestätigen
		const dialog = page.locator('dialog[open]');
		await expect(dialog).toBeVisible();
		await dialog.locator('button:has-text("Ja")').click();

		// Verifizieren: Redirect auf Startseite
		await expect(page).toHaveURL('/');
		
		// Optional: Prüfen, dass das Festival nicht mehr in der Liste ist (falls es eine Liste gibt)
		await expect(page.locator('body')).not.toContainText(updatedFestivalName);
	});
});
