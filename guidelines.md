# Project Guidelines: Festival Manager (SvelteKit + Sequelize)

## 1. Architektur Overview

- **Framework:** SvelteKit (Backend: Server-Side `+page.server.ts`, `+server.ts`).
- **Sprache:** TypeScript.
- **Datenbank:** MariaDB mit Sequelize als ORM. Modelle in `src/lib/db/model/` und Interfaces in `src/lib/db/attributes/`.
- **Business Logic:** Kapselung in Service-Klassen mit statischen Methoden in `src/lib/services/`.
- **Authentication:** Gesteuert über `src/hooks.server.ts` unter Verwendung von Session-Tokens in Cookies.
- **Testing:** Playwright wird für E2E-Tests verwendet (Happy Path, Authentifizierung). Tests befinden sich im Ordner `tests/`.
- **CI/CD:** Ein einheitlicher GitHub Action Workflow in `.github/workflows/pipeline.yml` führt Playwright-Tests bei jedem Push auf `main` oder Pull Requests aus.
  - Deployment erfolgt automatisch per `rsync` auf Uberspace nach erfolgreichen Tests auf dem `main` Branch.
  - **WICHTIG:** Auf dem Produktionsserver (z. B. Uberspace) muss der Service über `npm run start-server` gestartet werden. Dieser Befehl (`npm install && vite dev --host`) stellt sicher, dass alle Abhängigkeiten aktuell sind und der Server unter dem richtigen Host erreichbar ist.
  - Die Pipeline nutzt einen MariaDB Service Container.

## 2. Datenbank (Sequelize) Best Practices

- **Triad Rule:** Bei jeder Änderung an Feldern müssen drei Stellen aktualisiert werden:
  1. `src/lib/db/attributes/*.attributes.ts` (Interface)
  2. `src/lib/db/model/*.ts` (Sequelize Model Definition)
  3. `src/lib/db/db.ts` (Assoziationen/Beziehungen)
- **Explizite Fremdschlüssel:** Um "Duplicate column name"-Fehler bei `sequelize.sync({ alter: true })` zu vermeiden, müssen Fremdschlüssel (z. B. `UserId`, `FestivalEventId`) **sowohl** in der Model-Definition (`src/lib/db/model/*.ts`) **als auch** explizit in der Assoziationsdefinition (`src/lib/db/db.ts`) unter `foreignKey` angegeben werden.
- **Modelle & Beziehungen:**
  - **User:** Zentrale Entität hat 1:1 zu `UserImage` und `SessionToken`.
  - **FestivalEvent:** Besitzt von Usern (via `UserId`), hat viele `GuestInformation`.
  - **Gruppen:** `Group` (Besitzer: `ownerId`) & `GroupMember` (Mapping-Tabelle).
  - **Soziales:** `Friend`, `Friendship`, `FriendRequest` (Sender: `senderId`, Empfänger: `receiverId`).
  - Beziehungen sind in `src/lib/db/db.ts` definiert.
- **Primärschlüssel:** `DataTypes.STRING` mit `crypto.randomUUID()` für eindeutige IDs verwenden.
- **Asynchronität:** **IMMER** `async/await` mit `try/catch` in Services nutzen. `.then()` vermeiden.
- **Kaskadierung:** `onDelete: 'CASCADE'` in `db.ts` sicherstellen.
- **Initialisierung:** Erfolgt über `startDB()` in `src/lib/db/db.ts` mit `sequelize.sync({ alter: true })`.
- **Eager Loading (Include):** Falls ein Alias in `db.ts` definiert wurde (z.B. `as: 'EventGuests'`), muss dieser Alias zwingend auch im `include`-Statement im Service/Server-Loader verwendet werden, um `SequelizeEagerLoadingError` zu vermeiden. Achten Sie auf eindeutige Aliase bei mehreren Beziehungen zum selben Modell (z.B. `EventGuests` vs. `UserGuestInfos`).

## 3. SvelteKit & UI

- **Form-Actions:** Das `StandardResponse`-Modell für die Rückgabe von Daten aus Server-Actions verwenden.
- **Checkbox-Handling:** In Server-Actions müssen Checkboxen gegen den String `'on'` geprüft werden (`formData.get('name') === 'on'`), da sie bei Nicht-Selektion `null` zurückgeben, was bei einer einfachen `Boolean()`-Konvertierung zu Fehlern führen kann.
- **Access Control:** Immer `locals.currentUser` in `+page.server.ts` oder Actions prüfen. In Services `isChangeAllowed` zur Validierung nutzen.
- **Service-Rückgaben:** Methoden sollten `StandardResponse` oder `ChangeResult` zurückgeben.
- **Daten-Mapping:** Mapping-Funktionen (z.B. in `attributes.ts`) sollten robust gegenüber fehlenden Assoziationen sein (Null-Checks/Optional Chaining verwenden), da Sequelize-Modelle Assoziationen nur laden, wenn sie explizit mit `include` angefordert werden.

## 4. Coding Style

- Bestehende Namenskonventionen einhalten (camelCase für Eigenschaften, PascalCase für Modelle).
- `bcrypt-ts` für alle passwortbezogenen Operationen verwenden.
- Trennung zwischen `FrontendUser`, `BackendUser` und `CurrentUser` beibehalten.

## 5. Testing Best Practices (Playwright)

- **Parallelität vs. Datenbank-Zustand:** Da die Tests eine gemeinsame Datenbank nutzen, muss in `playwright.config.ts` die Parallelisierung deaktiviert werden (`fullyParallel: false`, `workers: 1`), um Race Conditions zu vermeiden.
- **Robustere Navigation:** Verwenden Sie `Promise.all([page.waitForURL(...), page.click(...)])`, um sicherzustellen, dass die Seite vollständig geladen ist, bevor Folgeschritte ausgeführt werden. Einfache Klicks ohne `waitForURL` sind in asynchronen Umgebungen fehleranfällig.
- **Hilfsfunktionen:** Nutzen Sie zentrale Funktionen in `tests/test-utils.ts` (z.B. `login`, `register`), um redundanten Code zu vermeiden und die Wartbarkeit zu erhöhen.
- **Test-Stabilität:** Da SvelteKit asynchron hydriert, sollten Tests explizit auf die Sichtbarkeit von Elementen warten (`toBeVisible()`), anstatt nur die URL-Änderung oder das Vorhandensein im DOM zu prüfen.
- **Serial Execution:** Wenn Tests aufeinander aufbauen (z. B. User-Registrierung -> Festival-Erstellung -> Edit), sollte `test.describe.serial` verwendet werden, um eine deterministische Reihenfolge sicherzustellen.
- **Retries:** In CI-Umgebungen sollten Retries aktiviert sein (`retries: 2`), um temporäre Netzwerk- oder Datenbankverzögerungen abzufangen.
- **Eindeutigkeit:** Test-Daten (Namen, E-Mails) sollten Zeitstempel (`Date.now()`) enthalten, um Kollisionen bei wiederholten Testläufen zu vermeiden.

## 6. Setup-Hinweise

- Erfordert `.env` Datei mit Zugangsdaten:
  - `MARIA_DB_USER`
  - `MARIA_DB_PASSWORD`
  - `MARIA_DB_NAME` (Datenbankname in App ist `USER_NAME + '_' + DB_NAME`).
- Standard-Port: `5173`.

## 7. Offene Punkte / TODOS

- `SessionToken`: Unterstützung mehrerer Sitzungen pro Benutzer evaluieren.
- **Datenbank-Konsistenz:** Da `sync({ alter: true })` produktiv Risiken birgt, sollte langfristig auf echte Migrationen umgestellt werden.
- **Frontend-Validierung:** Ergänzung von clientseitiger Validierung (z.B. Zod) zur Verbesserung der UX.
