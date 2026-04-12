import { test, expect } from '@playwright/test';
import { register, TEST_PASSWORD, login } from './test-utils';

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
		await login(page, userNickname, TEST_PASSWORD);

		// Zur Gruppenseite navigieren
		await page.goto('/group');
		await expect(page.getByText('Deine Gruppen')).toBeVisible();

		// Neue Gruppe anlegen
		await Promise.all([page.waitForURL('/group/new'), page.click('a[href="/group/new"]')]);

		await page.fill('input[name="name"]', groupName);
		await page.fill('textarea[name="description"]', groupDescription);
		await Promise.all([page.waitForURL(/\/group\/[0-9a-f-]+/), page.click('button[type="submit"]')]);

		// Verifizieren, dass wir auf der richtigen Seite sind (Gruppenname sollte dort stehen)
		await expect(page.getByRole('heading', { name: groupName })).toBeVisible();

		// Optional: Zurück zur Übersicht und prüfen, ob sie dort erscheint
		await page.goto('/group');
		await expect(page.getByText(groupName)).toBeVisible();
	});

	test.fixme('sollte nach Gruppen suchen können', async ({ page }) => {
		// Login
		await login(page, userNickname, TEST_PASSWORD);

		// Zur Gruppenseite navigieren
		await page.goto('/group');

		// Suche nach der zuvor erstellten Gruppe
		const searchInput = page.locator('input[name="q"]');
		await expect(searchInput).toBeVisible();
		await searchInput.fill(groupName);

		// Klick auf Suchen und warten auf Navigation
		await page.click('button[type="submit"]');

		// Verifizieren, dass die Suchergebnisse angezeigt werden
		// Wir prüfen erst auf den Text im Heading, da die URL-Prüfung flakig sein kann
		await expect(page.locator('h4')).toContainText(`Suchergebnisse für "${groupName}"`, { timeout: 15000 });

		// Und den Link zur Gruppe in der Suchsektion
		await expect(page.locator('.search-section ul li a', { hasText: groupName })).toBeVisible({ timeout: 15000 });

		// Suche nach einem Begriff, der keine Ergebnisse liefert
		await page.fill('input[name="q"]', 'NichtExistierendeGruppe_XYZ_123');
		await page.click('button[type="submit"]');

		await expect(page.getByText('Keine Gruppen gefunden.')).toBeVisible({ timeout: 15000 });
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
		await expect(page).toHaveURL(/\/group\/[0-9a-f-]+/, { timeout: 15000 });

		// URL der Gruppe merken
		const groupUrl = page.url();

		// Logout
		const logoutButton = page.getByRole('button', { name: 'Logout' });
		await expect(logoutButton).toBeVisible();
		await logoutButton.click();

		// Sicherstellen, dass Logout erfolgreich war
		await expect(page).toHaveURL('/login', { timeout: 15000 });

		// Neuer Benutzer registrieren
		const joinerNickname = `Joiner_${Date.now()}`;
		await register(page, joinerNickname, TEST_PASSWORD);

		// Zur Gruppenseite navigieren
		await page.goto(groupUrl);

		// Beitreten Button sollte sichtbar sein
		const joinButton = page.getByRole('button', { name: 'Beitreten' });
		await expect(joinButton).toBeVisible({ timeout: 15000 });

		// Beitreten klicken
		await page.click('form[action="?/join"] button:has-text("Beitreten")');

		// Erfolgsmeldung prüfen
		await expect(page.locator('.message.success')).toContainText('Du bist der Gruppe erfolgreich beigetreten!', {
			timeout: 15000
		});

		// Beitreten Button sollte nun weg sein
		await expect(joinButton).not.toBeVisible();

		// Prüfen ob der Benutzer in der Mitgliederliste steht
		// Wir nutzen .last(), da der Name im Header (nav) und in der Mitgliederliste (section) vorkommt
		await expect(page.locator('section').getByText(joinerNickname)).toBeVisible();
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
		await Promise.all([page.waitForURL(/\/group\/[0-9a-f-]+\/edit/), editButton.click()]);

		// Wir sollten auf der Edit-Seite sein
		await expect(page.getByRole('heading', { name: 'Gruppe bearbeiten' })).toBeVisible();

		// Felder ausfüllen
		await page.fill('input[name="name"]', updatedName);
		await page.fill('textarea[name="description"]', updatedDesc);
		await Promise.all([page.waitForURL(/\/group\/[0-9a-f-]+$/), page.click('button[type="submit"]')]);

		// Wir sollten zurück auf der Detailseite sein
		await expect(page).not.toHaveURL(/\/edit/);

		// Änderungen verifizieren
		await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
		await expect(page.getByText(updatedDesc)).toBeVisible();
	});

	test.fixme('ein Mitglied sollte eine Gruppe verlassen können', async ({ page }) => {
		// Erst erstellen wir eine Gruppe mit dem ersten Benutzer
		const creatorNickname = `CreatorLeave_${Date.now()}`;
		const leaveGroupName = `LeaveMeGroup_${Date.now()}`;
		await register(page, creatorNickname, TEST_PASSWORD);

		// Gruppe erstellen
		await page.goto('/group/new');
		await page.fill('input[name="name"]', leaveGroupName);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/group\/[0-9a-f-]+/, { timeout: 15000 });

		// URL der Gruppe merken
		const groupUrl = page.url();

		// Logout über den Button
		const logoutButton = page.getByRole('button', { name: 'Logout' });
		await expect(logoutButton).toBeVisible();
		await logoutButton.click();
		await expect(page).toHaveURL('/login', { timeout: 15000 });

		// Ein anderer Benutzer registriert sich und tritt bei
		const memberNickname = `MemberLeave_${Date.now()}`;
		await register(page, memberNickname, TEST_PASSWORD);

		// Zur Gruppe navigieren und beitreten
		await page.goto(groupUrl);
		const joinButton = page.getByRole('button', { name: 'Beitreten' });
		await expect(joinButton).toBeVisible({ timeout: 15000 });
		await joinButton.click();

		// Verifizieren, dass er beigetreten ist
		await expect(page.locator('.message.success')).toContainText('Du bist der Gruppe erfolgreich beigetreten!', {
			timeout: 15000
		});
		await expect(page.locator('section').getByText(memberNickname)).toBeVisible({ timeout: 15000 });

		// Verlassen Button sollte nun sichtbar sein
		const leaveButton = page.getByRole('button', { name: 'Gruppe verlassen' });
		await expect(leaveButton).toBeVisible({ timeout: 15000 });

		// Verlassen klicken
		await leaveButton.click();

		// Erfolgsmeldung prüfen
		await expect(page.locator('.message.success')).toContainText('Du hast die Gruppe verlassen.', { timeout: 15000 });

		// Verlassen Button sollte nun weg sein
		await expect(leaveButton).not.toBeVisible();

		// Beitreten Button sollte wieder da sein
		await expect(page.getByRole('button', { name: 'Beitreten' })).toBeVisible({ timeout: 15000 });

		// Prüfen ob der Benutzer nicht mehr in der Mitgliederliste steht
		await expect(page.locator('section').getByText(memberNickname)).not.toBeVisible();
	});
});
