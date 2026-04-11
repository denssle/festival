import { test, expect } from '@playwright/test';
import { register } from './test-utils';

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

		// Datum setzen
		await page.fill('input[name="startDate"]', '2026-08-15');
		await page.fill('input[name="startTime"]', '18:00');

		await page.check('input[name="bringYourOwnFood"]');
		await page.check('input[name="bringYourOwnBottle"]');

		// Absenden und auf Navigation warten
		await Promise.all([page.waitForURL(/\/festival\/[a-z0-9-]+$/), page.click('button:has-text("Speichern")')]);

		// Verifizieren: Heading auf der Detailseite
		await expect(page.getByRole('heading', { level: 4, name: festivalName })).toBeVisible();

		// ID extrahieren
		festivalId = page.url().split('/').pop() || '';
	});

	test('sollte das Festival bearbeiten können', async () => {
		await page.goto(`/festival/${festivalId}`);
		await expect(page.locator('h4 u')).toContainText(festivalName, { timeout: 15000 });

		await page.goto(`/festival/${festivalId}/edit`);
		await expect(page).toHaveURL(`/festival/${festivalId}/edit`, { timeout: 15000 });

		const nameInput = page.locator('input[name="name"]');
		await expect(nameInput).toBeVisible({ timeout: 15000 });
		await nameInput.fill(updatedFestivalName);

		const descriptionInput = page.locator('textarea[name="description"]');
		await descriptionInput.fill('Aktualisierte Beschreibung für den Test.');

		const locationInput = page.locator('textarea[name="location"]');
		await locationInput.fill('Neuer Test-Ort');

		/* TODO
		const foodCheckbox = page.locator('input[name="bringYourOwnFood"]');
		if (await foodCheckbox.isChecked()) {
			await foodCheckbox.uncheck();
		}

		const bottleCheckbox = page.locator('input[name="bringYourOwnBottle"]');
		if (!(await bottleCheckbox.isChecked())) {
			await bottleCheckbox.check();
		}
		 */

		const saveButton = page.locator('button[type="submit"]', { hasText: 'Speichern' });
		await Promise.all([
			page.waitForURL(new RegExp(`/festival/${festivalId}$`), { timeout: 15000 }),
			saveButton.click()
		]);

		await expect(page.locator('h4 u')).toContainText(updatedFestivalName, { timeout: 15000 });
		// TODO await expect(page.locator('p')).toContainText('Aktualisierte Beschreibung für den Test.');
		// await expect(page.locator('input[name="bringYourOwnFood"]')).not.toBeChecked();
		// await expect(page.locator('input[name="bringYourOwnBottle"]')).toBeChecked();
	});

	test('sollte zu einem Festival zusagen können', async () => {
		await page.goto(`/festival/${festivalId}`);
		await expect(page.locator('h4 u')).toContainText(updatedFestivalName, { timeout: 15000 });

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

		// In der Tabelle "Zusagen" prüfen
		const comingTable = page
			.locator('section')
			.filter({ has: page.locator('h5', { hasText: 'Zusagen:' }) })
			.locator('table');
		await expect(comingTable).toContainText(userNickname, { timeout: 15000 });
		await expect(comingTable).toContainText('Pizza');
		await expect(comingTable).toContainText('Bier');
	});

	test('sollte eine Zusage bearbeiten können', async () => {
		await page.goto(`/festival/${festivalId}`);

		// Button sollte nun "Zusage bearbeiten" heißen
		const editJoinButton = page.locator('button:has-text("Zusage bearbeiten")');
		await expect(editJoinButton).toBeVisible({ timeout: 15000 });
		await editJoinButton.click();

		const dialog = page.locator('dialog[open]');
		await expect(dialog).toBeVisible({ timeout: 15000 });

		// Daten ändern
		await dialog.locator('#food').fill('Pasta');
		await dialog.locator('#drink').fill('Wein');

		await dialog.locator('button:has-text("Beitreten")').click();
		await expect(dialog).not.toBeVisible({ timeout: 15000 });

		// Geänderte Daten in der Tabelle prüfen
		const comingTable = page
			.locator('section')
			.filter({ has: page.locator('h5', { hasText: 'Zusagen:' }) })
			.locator('table');
		await expect(comingTable).toContainText('Pasta', { timeout: 15000 });
		await expect(comingTable).toContainText('Wein', { timeout: 15000 });
		await expect(comingTable).not.toContainText('Pizza');
	});

	test('sollte zum Festival absagen können', async () => {
		await page.goto(`/festival/${festivalId}`);

		// Absagen Button klicken (In der Button-Leiste am Ende der Seite)
		const leaveButton = page.locator('article > section').last().locator('button:has-text("Absagen")');
		await expect(leaveButton).toBeVisible();
		await leaveButton.click();

		const dialog = page.locator('dialog[open]');
		await expect(dialog).toBeVisible();
		await expect(dialog).toContainText('Leider bin ich / sind wir bei dem Event nicht dabei.');

		// Kommentar hinzufügen
		await page.fill('#comment', 'Leider keine Zeit');

		// Bestätigen (Button Label ist "Absagen" laut CancelInvitationDialog.svelte)
		// Wir nutzen hier den Button innerhalb des Dialogs
		await dialog.locator('button:has-text("Absagen")').click();
		await expect(dialog).not.toBeVisible();

		// In der Tabelle "Absagen" prüfen
		const notComingTable = page.locator('section:has(h5:has-text("Absagen:")) table');
		await expect(notComingTable).toContainText(userNickname);
		await expect(notComingTable).toContainText('Leider keine Zeit');

		// Der User sollte NICHT mehr in der "Zusagen" Tabelle stehen (falls die Tabelle überhaupt noch da ist)
		const comingSection = page.locator('section:has(h5:has-text("Zusagen:"))');
		if ((await comingSection.locator('table').count()) > 0) {
			await expect(comingSection.locator('table')).not.toContainText(userNickname);
		} else {
			await expect(comingSection).toContainText('Es hat noch niemand zugesagt.');
		}
	});

	test('sollte eine Absage bearbeiten können', async () => {
		await page.goto(`/festival/${festivalId}`);

		// Button sollte nun "Absage bearbeiten" heißen
		const editLeaveButton = page.locator('article > section').last().locator('button:has-text("Absage bearbeiten")');
		await expect(editLeaveButton).toBeVisible();
		await editLeaveButton.click();

		const dialog = page.locator('dialog[open]');
		await expect(dialog).toBeVisible();

		// Kommentar ändern
		await page.fill('#comment', 'Bin doch im Urlaub');

		await dialog.locator('button:has-text("Absagen")').click();
		await expect(dialog).not.toBeVisible();

		// Geänderte Daten in der Tabelle prüfen
		const notComingTable = page.locator('section:has(h5:has-text("Absagen:")) table');
		await expect(notComingTable).toContainText('Bin doch im Urlaub');
		await expect(notComingTable).not.toContainText('Leider keine Zeit');
	});

	test('sollte von einer Absage wieder zur Zusage wechseln können', async () => {
		await page.goto(`/festival/${festivalId}`);

		// Wieder auf Zusagen klicken (heißt aktuell "Zusagen", da wir abgesagt haben)
		const joinButton = page.locator('article > section').last().locator('button:has-text("Zusagen")');
		await expect(joinButton).toBeVisible();
		await joinButton.click();

		const dialog = page.locator('dialog[open]');
		await expect(dialog).toBeVisible();

		await page.fill('#food', 'Salat');
		await dialog.locator('button:has-text("Beitreten")').click();
		await expect(dialog).not.toBeVisible();

		// Prüfen, dass wieder in der Zusage-Tabelle
		const comingTable = page.locator('section:has(h5:has-text("Zusagen:")) table');
		await expect(comingTable).toContainText(userNickname);
		await expect(comingTable).toContainText('Salat');

		// Und nicht mehr in der Absage-Tabelle
		const notComingTable = page.locator('section:has(h5:has-text("Absagen:"))');
		await expect(notComingTable).not.toContainText(userNickname);
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
