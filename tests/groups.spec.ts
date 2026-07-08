import { test, expect } from '@playwright/test';
import { register, TEST_PASSWORD, login, uniqueName, openDialog } from './test-utils';

test.describe.serial('Gruppen Management', () => {
	const userNickname = uniqueName('GroupUser');
	const groupName = uniqueName('TestGruppe');
	const groupDescription = 'Dies ist eine Testbeschreibung für eine Gruppe.';

	test.beforeAll(async ({ browser }) => {
		const requestContext = await browser.newContext();
		await requestContext.request.post('/api/test/reset');
		await requestContext.close();

		const page = await browser.newPage();
		await register(page, userNickname, TEST_PASSWORD);
		await page.waitForLoadState('networkidle');

		// Gruppe vorab anlegen, damit sie für alle Tests verfügbar ist
		await page.goto('/group/new', { waitUntil: 'networkidle' });
		await page.fill('input[name="name"]', groupName);
		await page.fill('textarea[name="description"]', groupDescription);
		await Promise.all([
			page.waitForURL(/\/group\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/),
			page.click('button[type="submit"]')
		]);
		await page.waitForLoadState('networkidle');
		await page.close();
	});

	test('sollte eine neue Gruppe anlegen können', async ({ page }) => {
		// Gruppe wurde in beforeAll angelegt – hier nur verifizieren
		await login(page, userNickname, TEST_PASSWORD);
		await page.waitForLoadState('networkidle');
		await page.goto('/group', { waitUntil: 'networkidle' });
		await expect(page.getByText(groupName)).toBeVisible({ timeout: 15000 });
	});

	test('sollte nach Gruppen suchen können', async ({ page }) => {
		// Login
		await login(page, userNickname, TEST_PASSWORD);
		await page.waitForLoadState('networkidle');

		// Zur Gruppenseite navigieren
		await page.goto('/group', { waitUntil: 'networkidle' });

		// Suche nach der zuvor erstellten Gruppe
		const searchInput = page.locator('input[name="q"]');
		await expect(searchInput).toBeVisible();
		await searchInput.fill(groupName);

		// Klick auf Suchen und auf Seitenaktualisierung warten
		await Promise.all([page.waitForLoadState('networkidle'), page.click('button[type="submit"]')]);

		// Verifizieren, dass die Suchergebnisse angezeigt werden
		await expect(page.locator('h4')).toContainText(`Suchergebnisse für "${groupName}"`, { timeout: 15000 });

		// Und den Link zur Gruppe in den Suchergebnissen
		await expect(page.locator(`a[href*="/group/"]:has-text("${groupName}")`).first()).toBeVisible({ timeout: 15000 });

		// Suche nach einem Begriff, der keine Ergebnisse liefert
		await page.fill('input[name="q"]', 'NichtExistierendeGruppe_XYZ_123');
		await page.click('button[type="submit"]');

		await expect(page.getByText('Keine Gruppen gefunden.')).toBeVisible({ timeout: 15000 });
	});

	test('sollte anzeigen, dass man in keiner Gruppe ist (bei neuem User)', async ({ page }) => {
		const emptyUser = uniqueName('EmptyGroupUser');
		await register(page, emptyUser, TEST_PASSWORD);

		await page.goto('/group');
		await expect(page.getByText('Du bist in keiner Gruppe.')).toBeVisible();
	});

	test('ein neuer Benutzer sollte einer bestehenden Gruppe beitreten können', async ({ page }) => {
		// Erst erstellen wir eine Gruppe mit dem ersten Benutzer
		const creatorNickname = uniqueName('Creator');
		const joinableGroupName = uniqueName('JoinMeGroup');
		await register(page, creatorNickname, TEST_PASSWORD);

		// Gruppe erstellen
		await page.goto('/group/new');
		await page.fill('input[name="name"]', joinableGroupName);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/group\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/, {
			timeout: 15000
		});

		// URL der Gruppe merken
		const groupUrl = page.url();

		// Logout
		const logoutButton = page.getByRole('button', { name: 'Logout' });
		await expect(logoutButton).toBeVisible();
		await logoutButton.click();
		await page.waitForURL('/login', { timeout: 15000 });
		await page.waitForLoadState('networkidle');

		// Neuer Benutzer registrieren
		const joinerNickname = uniqueName('Joiner');
		await register(page, joinerNickname, TEST_PASSWORD);
		await page.waitForLoadState('networkidle');

		// Zur Gruppenseite navigieren
		await page.goto(groupUrl, { waitUntil: 'networkidle' });

		// Beitreten Button sollte sichtbar sein
		const joinButton = page.getByRole('button', { name: 'Beitreten' });
		await expect(joinButton).toBeVisible({ timeout: 30000 });

		// Beitreten klicken und auf Seitenaktualisierung warten
		await Promise.all([
			page.waitForResponse((resp: any) => resp.url().includes('/join'), { timeout: 30000 }),
			page.click('form[action="?/join"] button:has-text("Beitreten")')
		]);
		await page.waitForLoadState('networkidle');

		// Beitreten Button sollte nun weg sein
		await expect(joinButton).not.toBeVisible({ timeout: 15000 });

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

		// Löschen klicken -> Bestätigungsdialog (QuestionDialog) mit "Ja" bestätigen.
		// openDialog wiederholt den Klick bei Hydration-Race (verlorener Klick).
		const confirmDialog = page.locator('dialog', { hasText: 'löschen möchtest' });
		await openDialog(deleteButton, confirmDialog);
		await confirmDialog.getByRole('button', { name: 'Ja' }).click();

		// Nach dem Löschen sollten wir auf der Gruppenseite sein
		await expect(page).toHaveURL('/group');

		// Die Gruppe sollte nicht mehr als Link auf der Gruppenseite erscheinen
		await expect(page.getByRole('link', { name: groupToDel })).toHaveCount(0);
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

	test('ein Mitglied sollte eine Gruppe verlassen können', async ({ page }) => {
		// Erst erstellen wir eine Gruppe mit dem ersten Benutzer
		const creatorNickname = `CreatorLeave_${Date.now()}`;
		const leaveGroupName = `LeaveMeGroup_${Date.now()}`;
		await register(page, creatorNickname, TEST_PASSWORD);

		// Gruppe erstellen
		await page.goto('/group/new');
		await page.fill('input[name="name"]', leaveGroupName);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/group\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/, {
			timeout: 15000
		});

		// URL der Gruppe merken
		const groupUrl = page.url();

		// Logout über den Button
		const logoutButton = page.getByRole('button', { name: 'Logout' });
		await expect(logoutButton).toBeVisible();
		await logoutButton.click();
		await page.waitForURL('/login', { timeout: 15000 });
		await page.waitForLoadState('networkidle');

		// Ein anderer Benutzer registriert sich und tritt bei
		const memberNickname = `MemberLeave_${Date.now()}`;
		await register(page, memberNickname, TEST_PASSWORD);
		await page.waitForLoadState('networkidle');

		// Zur Gruppe navigieren und beitreten
		await page.goto(groupUrl, { waitUntil: 'networkidle' });
		const joinButton = page.getByRole('button', { name: 'Beitreten' });
		await expect(joinButton).toBeVisible({ timeout: 15000 });

		await Promise.all([
			page.waitForResponse((resp: any) => resp.url().includes('/join'), { timeout: 15000 }),
			joinButton.click()
		]);
		await page.waitForLoadState('networkidle');

		// Verifizieren, dass er beigetreten ist
		await expect(page.locator('section').getByText(memberNickname)).toBeVisible({ timeout: 15000 });

		// Verlassen Button sollte nun sichtbar sein
		const leaveButton = page.getByRole('button', { name: 'Gruppe verlassen' });
		await expect(leaveButton).toBeVisible({ timeout: 15000 });

		// Verlassen klicken und auf Response warten
		await Promise.all([
			page.waitForResponse((resp: any) => resp.url().includes('/leave'), { timeout: 15000 }),
			leaveButton.click()
		]);
		await page.waitForLoadState('networkidle');

		// Verlassen Button sollte nun weg sein
		await expect(leaveButton).not.toBeVisible({ timeout: 15000 });

		// Beitreten Button sollte wieder da sein
		await expect(page.getByRole('button', { name: 'Beitreten' })).toBeVisible({ timeout: 15000 });

		// Prüfen ob der Benutzer nicht mehr in der Mitgliederliste steht
		await expect(page.locator('section').getByText(memberNickname)).not.toBeVisible({ timeout: 15000 });
	});
});
