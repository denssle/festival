---
apply: always
---

# AI Assistant Rules (Festival Manager)

Du bist ein erfahrener Software-Entwickler, der am Festival Manager arbeitet (SvelteKit + Sequelize). Halte dich strikt an die folgenden Regeln:

## 1. Datenbank (Sequelize) & Triad Rule

- **Triad Rule:** Bei JEDER Änderung an Datenbankfeldern müssen IMMER diese drei Stellen aktualisiert werden:
  1. `src/lib/db/attributes/*.attributes.ts` (Interface)
  2. `src/lib/db/model/*.ts` (Sequelize Model Definition)
  3. `src/lib/db/db.ts` (Assoziationen/Beziehungen)
- **IDs:** Verwende für Primärschlüssel `DataTypes.STRING` mit `crypto.randomUUID()`.
- **Asynchronität:** Nutze in Services ausschließlich `async/await` mit `try/catch`. Vermeide `.then()`.
- **Kaskadierung:** Stelle `onDelete: 'CASCADE'` in `db.ts` für alle relevanten Beziehungen sicher.
- **Initialisierung:** DB-Sync erfolgt über `startDB()` in `src/lib/db/db.ts` mit `sequelize.sync({ alter: true })`.

## 2. Architektur & Services

- **Business Logic:** Kapselung erfolgt in Service-Klassen mit statischen Methoden in `src/lib/services/`.
- **Rückgabetypen:** Methoden in Services müssen `StandardResponse` oder `ChangeResult` zurückgeben.
- **SvelteKit Server-Actions:** Verwende das `StandardResponse`-Modell für die Rückgabe von Daten an das Frontend.
- **Access Control:** Prüfe immer `locals.currentUser` in `+page.server.ts` oder Actions. Nutze `isChangeAllowed` in Services zur Validierung.

## 3. Coding Style

- **Benennung:** camelCase für Eigenschaften/Variablen, PascalCase für Modelle/Klassen.
- **Sicherheit:** Verwende `bcrypt-ts` für alle Passwort-Operationen.
- **User-Typen:** Beachte die Trennung zwischen `FrontendUser`, `BackendUser` und `CurrentUser`.
- **Sprache:** Kommentare und Bezeichner folgen dem bestehenden Stil (Deutsch/Englisch Mischung basierend auf Kontext, aber konsistent bleiben).

## 4. Testing

- **E2E-Tests:** Nutze Playwright für Tests in `tests/`. Erstelle oder aktualisiere Tests bei neuen Features oder Bugfixes.
- **CI/CD:** Beachte, dass Playwright-Tests in der GitHub Pipeline gegen einen MariaDB Container laufen.

## 5. Setup & Umgebung

- Erfordert eine `.env` Datei mit `MARIA_DB_USER`, `MARIA_DB_PASSWORD` und `MARIA_DB_NAME`.
- Die App nutzt den Standard-Port `5173`.
