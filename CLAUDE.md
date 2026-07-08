# Project Guidelines: Festival Manager (SvelteKit + Sequelize)

## 1. Architektur Overview

- **Framework:** SvelteKit (Backend: Server-Side `+page.server.ts`, `+server.ts`).
- **Sprache:** TypeScript.
- **Datenbank:** MariaDB mit Sequelize als ORM. Modelle in `src/lib/db/model/` und Interfaces in `src/lib/db/attributes/`.
- **Business Logic:** Kapselung in Service-Klassen mit statischen Methoden in `src/lib/services/`. Reine Berechnungs-/Validierungslogik wird in separaten `*.logic.ts`-Dateien (z.B. `festival-event.logic.ts`) ausgelagert und dort auch als Unit-Tests (`*.logic.spec.ts`) abgedeckt.
- **Authentication:** Gesteuert über `src/hooks.server.ts` unter Verwendung von Session-Tokens in Cookies.
- **Testing:** Playwright wird für E2E-Tests verwendet (Happy Path, Authentifizierung). Tests befinden sich im Ordner `tests/`.
- **CI/CD:** Ein einheitlicher GitHub Action Workflow in `.github/workflows/pipeline.yml` führt Playwright-Tests bei jedem Push auf `main` oder Pull Requests aus.
  - Deployment erfolgt automatisch per `rsync` auf Uberspace nach erfolgreichen Tests auf dem `main` Branch.
  - **WICHTIG:** Auf dem Produktionsserver (z. B. Uberspace) muss der Service über `npm run start-server` gestartet werden. Dieser Befehl (`npm install && vite dev --host`) stellt sicher, dass alle Abhängigkeiten aktuell sind und der Server unter dem richtigen Host erreichbar ist.
  - Die Pipeline nutzt einen MariaDB Service Container.

## 2. Datenbank (Sequelize) Best Practices

- **Triad Rule:** Bei JEDER Änderung an Datenbankfeldern müssen IMMER diese drei Stellen aktualisiert werden:
  1. `src/lib/db/attributes/*.attributes.ts` (Interface)
  2. `src/lib/db/model/*.ts` (Sequelize Model Definition)
  3. `src/lib/db/db.ts` (Assoziationen/Beziehungen)
- **Explizite Fremdschlüssel:** Um "Duplicate column name"-Fehler bei `sequelize.sync({ alter: true })` zu vermeiden, müssen Fremdschlüssel (z. B. `UserId`, `FestivalEventId`) **sowohl** in der Model-Definition (`src/lib/db/model/*.ts`) **als auch** explizit in der Assoziationsdefinition (`src/lib/db/db.ts`) unter `foreignKey` angegeben werden.
- **Modelle & Beziehungen:**
  - **User:** Zentrale Entität hat 1:1 zu `UserImage` und `SessionToken`.
  - **FestivalEvent:** Besitzt von Usern (via `UserId`), hat viele `GuestInformation`.
  - **Comment:** Kommentare zu Festivals oder Nutzerprofilen, eigenes Datenbankmodell in `src/lib/db/model/comment.ts`.
  - **Gruppen:** `Group` (Besitzer: `ownerId`) & `GroupMember` (Mapping-Tabelle). Gruppenbesitzer können die Gruppe nicht verlassen (nur löschen).
  - **Soziales:** `Friend` (Felder: `friend1Id`, `friend2Id`), `Friendship`, `FriendRequest` (Sender: `senderId`, Empfänger: `receiverId`).
  - Beziehungen sind in `src/lib/db/db.ts` definiert.
- **Primärschlüssel:** `DataTypes.STRING` mit `crypto.randomUUID()` für eindeutige IDs verwenden.
- **Asynchronität:** **IMMER** `async/await` mit `try/catch` in Services nutzen. `.then()` vermeiden.
- **Kaskadierung:** `onDelete: 'CASCADE'` in `db.ts` sicherstellen.
- **Initialisierung:** Erfolgt über `startDB()` in `src/lib/db/db.ts`. `force` und `alter` schließen sich gegenseitig aus und dürfen NICHT gemeinsam übergeben werden: In Test-/Dev-Umgebungen (`PLAYWRIGHT`, `NODE_ENV=test`, `MARIA_DB_NAME=dev`) wird `sync({ force: true })` genutzt (Tabellen werden neu erstellt), sonst produktiv `sync({ alter: true })`.
- **Eager Loading (Include):** Falls ein Alias in `db.ts` definiert wurde (z.B. `as: 'EventGuests'`), muss dieser Alias zwingend auch im `include`-Statement im Service/Server-Loader verwendet werden, um `SequelizeEagerLoadingError` zu vermeiden. Achten Sie auf eindeutige Aliase bei mehreren Beziehungen zum selben Modell (z.B. `EventGuests` vs. `UserGuestInfos`).

## 3. SvelteKit & UI

- **Form-Actions:** Das `StandardResponse`-Modell für die Rückgabe von Daten aus Server-Actions verwenden.
- **Checkbox-Handling:** In Server-Actions müssen Checkboxen gegen den String `'on'` geprüft werden (`formData.get('name') === 'on'`), da sie bei Nicht-Selektion `null` zurückgeben, was bei einer einfachen `Boolean()`-Konvertierung zu Fehlern führen kann.
- **Access Control:** Immer `locals.currentUser` in `+page.server.ts` oder Actions prüfen. In Services `isChangeAllowed` zur Validierung nutzen.
- **Service-Rückgaben:** Methoden sollten `StandardResponse` oder `ChangeResult` zurückgeben.
- **`ChangeResult`-Werte:** `'Success'` | `'Not authorized'` | `'Data Missing'` | `'Already in Group'` | `'Failure'`. Die Hilfsfunktion `getHTTPCodeForChangeResult(result)` in `src/lib/models/updates/ChangeResult.ts` mappt diese auf HTTP-Statuscodes (200, 403, 422, 409, 500) und sollte in `+server.ts`-Handlern verwendet werden.
- **Daten-Mapping:** Mapping-Funktionen (z.B. in `attributes.ts`) sollten robust gegenüber fehlenden Assoziationen sein (Null-Checks/Optional Chaining verwenden), da Sequelize-Modelle Assoziationen nur laden, wenn sie explizit mit `include` angefordert werden.

## 4. Coding Style

- Bestehende Namenskonventionen einhalten (camelCase für Eigenschaften, PascalCase für Modelle).
- `bcrypt-ts` für alle passwortbezogenen Operationen verwenden.
- Trennung zwischen `FrontendUser`, `BackendUser` und `CurrentUser` beibehalten.
- Transfer-Modelle in `src/lib/models/transferData/` (z.B. `FrontendComment`, `StandardResponse`) für die Kommunikation zwischen Frontend und Backend verwenden.
- `isChangeAllowed(userId, ownerId)` aus `src/lib/services/festival-event.logic.ts` für Berechtigungsprüfungen in Services nutzen (statt inline-Vergleiche).
- Kommentare und Bezeichner folgen dem bestehenden Stil (Deutsch/Englisch Mischung basierend auf Kontext, aber konsistent bleiben).

## 5. Testing Strategy

### Unit Testing (Vitest)

- **Fokus:** Isolierte Geschäftslogik, Service-Methoden, Validierungsfunktionen (`*.logic.ts`).
- **Framework:** `vitest`.
- **Ausführung:** `npm run test:unit`.
- **Regel:** Komplexe Berechnungen oder Geschäftslogik sollten immer als Unit-Test abgebildet werden, um die Testabdeckung ohne UI-Flakiness zu maximieren.

### E2E Testing (Playwright)

- **Fokus:** Kritische User Journeys, UI-Interaktionen, Authentifizierung.
- **Framework:** `playwright`.
- **Ausführung:** `npm run test` (oder `npm run test:ui`).
- **Parallelität:** Muss deaktiviert bleiben (`workers: 1`), da die E2E-Tests eine gemeinsame Datenbank teilen.
- **Stabilität:**
  - Nutzen Sie `waitForURL` für Navigation.
  - Verwenden Sie `dialog.waitFor({ state: 'visible' })` statt `expect(dialog).toBeVisible()` für `<dialog>`-Elemente, da letzteres bei noch nicht geöffneten Dialogen zu Timeouts führt.
  - `waitForResponse` **vor** dem auslösenden Klick registrieren (nicht in `Promise.all`), um Race Conditions zu vermeiden. Beispiel: `const res = page.waitForResponse(r => r.url().includes('/comments') && r.request().method() === 'POST'); await button.click(); await res;`
  - **Kein `waitForLoadState('load')` nach clientseitigen Fetch-Requests (SPA):** In SPA-Komponenten (z.B. `Comments.svelte`) lösen Fetch-Requests keine Seitennavigation aus. `waitForLoadState('load')` wartet auf eine Navigation, die nie kommt, und führt zu Timeouts. Stattdessen immer `waitForResponse` verwenden.
  - Nutzen Sie `waitForLoadState('networkidle')` nach Navigationen, um sicherzustellen, dass die Seite vollständig geladen ist.
  - Nutzen Sie `test.describe.serial` für Test-Sequenzen, die aufeinander aufbauen.
  - Eindeutige Testdaten (`Date.now()`) verwenden.
  - `test.fixme` vermeiden, stattdessen Tests aktiv halten und stabilisieren.
  - Bei mehreren `<dialog>`-Elementen auf einer Seite präzise Locators verwenden (z.B. `dialog:has-text("Titel")`), um "Strict mode violation" zu vermeiden.
  - Für API-Requests in Tests (z.B. DELETE), die Session-Cookies benötigen, `page.evaluate(() => fetch(...))` verwenden, damit der Browser seine eigenen Cookies mitsendet.

### Svelte Dialog-Handling

- **`bind:this` und `showModal()`:** Vor dem Registrieren eines Event-Listeners auf einem Dialog muss sichergestellt sein, dass `bind:this` gesetzt ist. `await tick()` vor `showModal()` einfügen, damit Svelte das DOM aktualisiert hat.
- **Event-Listener:** `addEventListener('close', handler)` statt der direkten `onclose`-Zuweisung verwenden, um sicherzustellen, dass Handler korrekt registriert und entfernt werden.
- **Svelte-Version:** Svelte 5 Runes-Syntax (`$state`, `$derived`, `$effect`, etc.) verwenden. Bestehende `$:`-Reaktivität und Svelte 4 Patterns schrittweise migrieren. Snippets statt Slots verwenden.

## 6. Setup-Hinweise

- Erfordert `.env` Datei mit Zugangsdaten:
  - `MARIA_DB_USER`
  - `MARIA_DB_PASSWORD`
  - `MARIA_DB_NAME` (Datenbankname in App ist `USER_NAME + '_' + DB_NAME`).
- Standard-Port: `5173`.

## 7. Offene Punkte / TODOs

- `SessionToken`: Unterstützung mehrerer Sitzungen pro Benutzer evaluieren.
- **Datenbank-Konsistenz:** Da `sync({ alter: true })` produktiv Risiken birgt, sollte langfristig auf echte Migrationen umgestellt werden.
- **Frontend-Validierung:** Ergänzung von clientseitiger Validierung (z.B. Zod) zur Verbesserung der UX.
