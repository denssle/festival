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

		// Redirect zur Gruppendetailseite (nicht mehr zur Übersicht)
		await expect(page).toHaveURL(/\/group\/[0-9a-f-]+/);

		// Verifizieren, dass wir auf der richtigen Seite sind (Gruppenname sollte dort stehen)
		await expect(page.getByRole('heading', { name: groupName })).toBeVisible();

		// Optional: Zurück zur Übersicht und prüfen, ob sie dort erscheint
		await page.goto('/group');
		await expect(page.getByText(groupName)).toBeVisible();
	});

	test('sollte nach Gruppen suchen können', async ({ page }) => {
		// Login
		await page.goto('/login');
		await page.fill('input[name="nickname"]', userNickname);
		await page.fill('input[name="password"]', TEST_PASSWORD);
		await page.click('button[type="submit"]');

		// Zur Gruppenseite navigieren
		await page.goto('/group');

		// Suche nach der zuvor erstellten Gruppe
		await page.fill('input[name="q"]', groupName);
		await page.click('button[type="submit"]');

		// Verifizieren, dass die Suchergebnisse angezeigt werden
		await expect(page.getByText(`Suchergebnisse für "${groupName}"`, { exact: true })).toBeVisible();
		await expect(page.locator('.search-section').getByText(groupName, { exact: true })).toBeVisible();

		// Suche nach einem Begriff, der keine Ergebnisse liefert
		await page.fill('input[name="q"]', 'NichtExistierendeGruppe_XYZ_123');
		await page.click('button[type="submit"]');

		await expect(page.getByText('Keine Gruppen gefunden.')).toBeVisible();
	});

	test('sollte anzeigen, dass man in keiner Gruppe ist (bei neuem User)', async ({ page }) => {
		const emptyUser = `EmptyGroupUser_${Date.now()}`;
		await register(page, emptyUser, TEST_PASSWORD);

		await page.goto('/group');
		await expect(page.getByText('Du bist in keiner Gruppe.')).toBeVisible();
	});

	test('ein neuer Benutzer sollte einer bestehenden Gruppe beitreten können', async ({ page }) => {
		// Erst erstellen wir eine Gruppe mit dem ersten Benutzer
		const creatorNickname = `Creator_${Date.now()}`;
		const joinableGroupName = `JoinMeGroup_${Date.now()}`;
		await register(page, creatorNickname, TEST_PASSWORD);

		// Gruppe erstellen
		await page.goto('/group/new');
		await page.fill('input[name="name"]', joinableGroupName);
		await page.click('button[type="submit"]');

		// URL der Gruppe merken
		await expect(page).toHaveURL(/\/group\/([0-9a-f-]+)/);
		const groupUrl = page.url();

		// Logout
		await page.goto('/logout');

		// Neuer Benutzer registrieren
		const joinerNickname = `Joiner_${Date.now()}`;
		await register(page, joinerNickname, TEST_PASSWORD);

		// Zur Gruppenseite navigieren
		await page.goto(groupUrl);

		// Beitreten Button sollte sichtbar sein
		const joinButton = page.getByRole('button', { name: 'Beitreten' });
		await expect(joinButton).toBeVisible();

		// Beitreten klicken
		await joinButton.click();

		// Erfolgsmeldung prüfen
		await expect(page.getByText('Du bist der Gruppe erfolgreich beigetreten!')).toBeVisible();

		// Beitreten Button sollte nun weg sein
		await expect(joinButton).not.toBeVisible();

		// Prüfen ob der Benutzer in der Mitgliederliste steht
		await expect(page.getByText(joinerNickname)).toBeVisible();
	});

	test('Besitzer sollte seine Gruppe löschen können', async ({ page }) => {
		const ownerNickname = `OwnerToDel_${Date.now()}`;
		const groupToDel = `DeleteMeGroup_${Date.now()}`;
		await register(page, ownerNickname, TEST_PASSWORD);

		// Gruppe erstellen
		await page.goto('/group/new');
		await page.fill('input[name="name"]', groupToDel);
		await page.click('button[type="submit"]');

		// Auf der Detailseite sollte der Löschen-Button sichtbar sein
		await expect(page).toHaveURL(/\/group\/([0-9a-f-]+)/);
		const deleteButton = page.getByRole('button', { name: 'Gruppe löschen' });
		await expect(deleteButton).toBeVisible();

		// Löschen klicken (Confirm Dialog wird automatisch von Playwright mit OK beantwortet, wenn nicht anders konfiguriert)
		page.on('dialog', (dialog) => dialog.accept());
		await deleteButton.click();

		// Nach dem Löschen sollten wir auf der Gruppenseite sein
		await expect(page).toHaveURL('/group');

		// Die Gruppe sollte nicht mehr unter "Deine Gruppen" erscheinen
		await expect(page.locator('.my-groups').getByText(groupToDel)).not.toBeVisible();
	});

	test('Besitzer sollte seine Gruppe bearbeiten können', async ({ page }) => {
		const ownerNickname = `OwnerToEdit_${Date.now()}`;
		const originalName = `OriginalGroup_${Date.now()}`;
		const updatedName = `UpdatedGroup_${Date.now()}`;
		const updatedDesc = 'Die Beschreibung wurde aktualisiert.';
		await register(page, ownerNickname, TEST_PASSWORD);

		// Gruppe erstellen
		await page.goto('/group/new');
		await page.fill('input[name="name"]', originalName);
		await page.click('button[type="submit"]');

		// Auf der Detailseite sollte der Bearbeiten-Button sichtbar sein
		await expect(page).toHaveURL(/\/group\/([0-9a-f-]+)/);
		const editButton = page.getByRole('link', { name: 'Bearbeiten' });
		await expect(editButton).toBeVisible();

		// Bearbeiten klicken
		await editButton.click();

		// Wir sollten auf der Edit-Seite sein
		await expect(page).toHaveURL(/\/group\/[0-9a-f-]+\/edit/);
		await expect(page.getByRole('heading', { name: 'Gruppe bearbeiten' })).toBeVisible();

		// Felder ausfüllen
		await page.fill('input[name="name"]', updatedName);
		await page.fill('textarea[name="description"]', updatedDesc);
		await page.click('button[type="submit"]');

		// Wir sollten zurück auf der Detailseite sein
		await expect(page).toHaveURL(/\/group\/[0-9a-f-]+/);
		await expect(page).not.toHaveURL(/\/edit/);

		// Änderungen verifizieren
		await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
		await expect(page.getByText(updatedDesc)).toBeVisible();
	});

	test('ein Mitglied sollte eine Gruppe verlassen können', async ({ page }) => {
		// Erst erstellen wir eine Gruppe mit dem ersten Benutzer
		const creatorNickname = `CreatorLeave_${Date.now()}`;
		const leaveGroupName = `LeaveMeGroup_${Date.now()}`;
		await register(page, creatorNickname, TEST_PASSWORD);

		// Gruppe erstellen
		await page.goto('/group/new');
		await page.fill('input[name="name"]', leaveGroupName);
		await page.click('button[type="submit"]');

		// URL der Gruppe merken
		await expect(page).toHaveURL(/\/group\/([0-9a-f-]+)/);
		const groupUrl = page.url();

		// Logout
		await page.goto('/logout');

		// Ein anderer Benutzer tritt bei
		const memberNickname = `MemberLeave_${Date.now()}`;
		await register(page, memberNickname, TEST_PASSWORD);

		// Zur Gruppe navigieren und beitreten
		await page.goto(groupUrl);
		await page.getByRole('button', { name: 'Beitreten' }).click();
		await expect(page.getByText('Mitglieder').locator('..').getByText(memberNickname)).toBeVisible();

		// Verlassen Button sollte nun sichtbar sein
		const leaveButton = page.getByRole('button', { name: 'Gruppe verlassen' });
		await expect(leaveButton).toBeVisible();

		// Verlassen klicken
		await leaveButton.click();

		// Erfolgsmeldung prüfen (Wir haben die Meldung auf "Aktion erfolgreich ausgeführt!" generalisiert)
		await expect(page.getByText('Aktion erfolgreich ausgeführt!')).toBeVisible();

		// Verlassen Button sollte nun weg sein
		await expect(leaveButton).not.toBeVisible();

		// Beitreten Button sollte wieder da sein
		await expect(page.getByRole('button', { name: 'Beitreten' })).toBeVisible();

		// Prüfen ob der Benutzer nicht mehr in der Mitgliederliste steht
		await expect(page.getByText('Mitglieder').locator('..').getByText(memberNickname)).not.toBeVisible();
	});
});
