# Project Guidelines: Festival Manager (SvelteKit + Sequelize)

## 1. Architektur Overview

- **Framework:** SvelteKit (Backend: Server-Side `+page.server.ts`, `+server.ts`).
- **Sprache:** TypeScript.
- **Datenbank:** MariaDB mit Sequelize als ORM. Modelle in `src/lib/db/model/` und Interfaces in `src/lib/db/attributes/`.
- **Business Logic:** Kapselung in Service-Klassen mit statischen Methoden in `src/lib/services/`. Reine Berechnungs-/Validierungslogik wird in separaten `*.logic.ts`-Dateien (z.B. `festival-event.logic.ts`) ausgelagert und dort auch als Unit-Tests (`*.logic.spec.ts`) abgedeckt.
- **Authentication:** Gesteuert über `src/hooks.server.ts` unter Verwendung von Session-Tokens in Cookies.
- **Testing:** Playwright wird für E2E-Tests verwendet (Happy Path, Authentifizierung). Tests befinden sich im Ordner `tests/`.
- **CI/CD:** Zwei GitHub-Action-Workflows: `.github/workflows/tests.yml` führt die Playwright-Tests bei jedem Push auf `main` oder Pull Requests aus; `.github/workflows/deploy.yml` deployt nach erfolgreichem Test-Workflow auf `main` (via `workflow_run`).
  - Deployment erfolgt automatisch per `rsync` auf Uberspace nach erfolgreichen Tests auf dem `main` Branch.
  - **WICHTIG:** Produktion läuft über `@sveltejs/adapter-node`. Die Pipeline baut mit `vite build` einen eigenständigen Node-Server unter `build/`; der Supervisor-Service startet ihn über `npm run start-server` (= `PORT=5173 node build`) im Verzeichnis `~/html`. Die Pipeline installiert vor dem Restart die Produktions-Abhängigkeiten auf dem Host (`npm ci --omit=dev`). Kein `vite dev`/`npm install` mehr bei jedem Restart → Start in Sekunden.
  - **Die Pipeline nutzt KEINEN MariaDB-Service-Container.** `tests.yml` startet nur Node + Playwright; die E2E-Tests laufen dort (wie lokal) über `PLAYWRIGHT=true` gegen eine In-Memory-SQLite (siehe `sequelize.ts`). **Konsequenz:** MariaDB-spezifisches SQL wird in keiner automatisierten Prüfung getestet — relevant, sobald echte Migrationen eingeführt werden (siehe TODO „Schema-Stabilität", dort ist ein MariaDB-Job als Drift-Schutz Teil des Plans).

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
- **Initialisierung:** Erfolgt über `startDB()` in `src/lib/db/db.ts` und nutzt ein schlichtes `sync()` (**kein** `alter`/`force`). `sync()` legt fehlende Tabellen an und lässt bestehende unangetastet. In Test-/Dev-Umgebungen läuft die DB als frisches In-Memory-SQLite (siehe `sequelize.ts`) – dort baut `sync()` die Tabellen bei jedem Start von Grund auf. In Produktion (echte MariaDB) werden die Tabellen beim ersten Start angelegt; **spätere Modelländerungen an einer bereits befüllten DB werden NICHT automatisch übernommen** und erfordern echte Migrationen (siehe TODO). `alter` wurde bewusst entfernt, um versehentlichen Datenverlust durch heuristische Schemaänderungen zu vermeiden. Sauberkeit zwischen E2E-Tests stellt der `/api/test/reset`-Endpoint her (truncate, setzt existierende Tabellen voraus).
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

## 6. Setup- & Umgebungs-Hinweise

Die App liest Zugangsdaten aus einer `.env`-Datei (via `$env/dynamic/private`). Die `.env` ist **gitignored** und wird beim Deploy per `--exclude=".env"` vom rsync geschützt, liegt also nur lokal bzw. auf dem Host — sie darf niemals eingecheckt werden.

### Erforderliche App-Env-Variablen

| Variable            | Zweck                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `MARIA_DB_USER`     | MariaDB-Benutzer **und** Präfix des DB-Namens. Der effektive Datenbankname ist `MARIA_DB_USER + '_' + MARIA_DB_NAME`. |
| `MARIA_DB_PASSWORD` | MariaDB-Passwort.                                                                                                     |
| `MARIA_DB_NAME`     | Suffix des DB-Namens (siehe oben). **Siehe SQLite-Falle unten.**                                                      |

### ⚠️ SQLite-Falle (kritisch für Produktion)

In `src/lib/db/sequelize.ts` schaltet die App auf eine **flüchtige In-Memory-SQLite-DB** um, sobald **eine** dieser Bedingungen zutrifft: `MARIA_DB_NAME == 'dev'`, `NODE_ENV === 'test'`, `VITEST === 'true'` oder `PLAYWRIGHT === 'true'`. Das ist für lokale Entwicklung/Tests gewollt (kein MariaDB nötig), aber:

- **In Produktion MUSS `MARIA_DB_NAME` einen anderen Wert als `dev` haben** und es dürfen `NODE_ENV=test`/`VITEST`/`PLAYWRIGHT` **nicht** gesetzt sein. Andernfalls läuft die App still auf einer SQLite-DB im RAM → alle Daten sind nach jedem Restart weg.
- Die lokal committete Entwicklungs-Umgebung nutzt bewusst `MARIA_DB_NAME="dev"`; die `.env` auf dem Prod-Host muss davon abweichen.

### Runtime

- **Node-Version:** `22.20.0` (siehe `deploy.yml`).
- **Port:** `5173`. Gesetzt über `npm run start-server` (= `PORT=5173 node build`); `@sveltejs/adapter-node` liest `PORT` (optional auch `HOST`).
- `npm_package_version` wird von npm automatisch gesetzt und auf der About-Seite angezeigt (keine manuelle Pflege nötig).

### Deployment (Uberspace)

- **GitHub-Actions-Secrets** (nicht App-Env, sondern für den Deploy-Workflow): `UBERSPACE_USER`, `UBERSPACE_HOST`, `DEPLOY_KEY_PRIVATE`.
- **Ablauf:** `deploy.yml` baut `build/` mit `npm run build`, rsynct nach `~/html` (ohne `.env` und `node_modules`), installiert dort Prod-Deps via `npm ci --omit=dev` und startet den Supervisor-Service neu.
- **Supervisor-Service:** heißt `festival`, führt `npm run start-server` im Verzeichnis `~/html` aus (Config unter `~/etc/services.d/festival.ini`). Restart via `supervisorctl restart festival`; danach Health-Check gegen `http://localhost:5173/`.

### Altlasten in `.env`

`REDIS_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` waren Überbleibsel eines früheren, letztlich verworfenen Datenspeicher-Ansatzes (Upstash/Redis) vor dem Umstieg auf MariaDB. Sie werden **nirgends im Code genutzt** und wurden entfernt. Falls sie in einer älteren `.env` (z. B. auf dem Prod-Host) noch vorhanden sind, können sie gelöscht werden.

## 7. Offene Punkte / TODOs

- `SessionToken`: Unterstützung mehrerer Sitzungen pro Benutzer evaluieren (aktuell 1 Token/User, da `UserId` = PK). _Erledigt (v0.7.2): serverseitige Token-Ablaufprüfung (`isSessionTokenExpired`, absolute Lebensdauer `SESSION_MAX_AGE_MS`)._
- **Datenbank-Konsistenz:** Langfristig auf echte Migrationen statt `sync({ alter: true })` umstellen. _Aktuell unkritisch, solange die Prod-DB leer ist (kein Datenverlust-Risiko); vor dem ersten echten Datenbestand angehen._
- **Frontend-Validierung:** Ergänzung von clientseitiger Validierung (z.B. Zod) zur Verbesserung der UX.
