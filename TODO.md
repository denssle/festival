# TODO

Hier werden alle offenen Aufgaben für das Projekt gesammelt.
Sortiert nach **Aufwand** (S → M → L), innerhalb jeder Stufe nach **Priorität** (🔴 → 🟡 → 🟢).

## Legende

| Priorität  | Bedeutung                                                         |
| ---------- | ----------------------------------------------------------------- |
| 🔴 Hoch    | Sicherheitsrisiko oder starke Beeinträchtigung der Nutzbarkeit    |
| 🟡 Mittel  | Wichtig für Qualität/Stabilität, aber kein akuter Handlungsbedarf |
| 🟢 Niedrig | Nice-to-have, technische Schulden oder Komfort-Features           |

| Aufwand | Bedeutung                                                  |
| ------- | ---------------------------------------------------------- |
| S       | Klein – wenige Zeilen, isolierte Änderung (< 1h)           |
| M       | Mittel – mehrere Dateien oder moderate Logik (1–4h)        |
| L       | Groß – Architekturänderung, viele Stellen betroffen (> 4h) |

---

## [S] Klein (< 1h)

- [x] 🟡 **GitHub-Actions – Node-20-Deprecation:** ~~`actions/checkout@v4` und `actions/setup-node@v4` laufen noch auf Node 20.~~ _Erledigt (v0.7.10): `checkout@v5`, `setup-node@v5` und `upload-artifact@v5` (alle Node-24-nativ) in `tests.yml` und `deploy.yml`._ _(Deployment)_
- [x] 🟡 **Dokumentation:** ~~Produktions-Umgebung (env) sauber dokumentieren.~~ _Erledigt (v0.7.6): CLAUDE.md Abschnitt 6 um erforderliche Env-Variablen, die SQLite-Falle (`MARIA_DB_NAME != 'dev'` in Prod), Runtime/Port, Deploy-Secrets, Supervisor-Service und ungenutzte Redis-Variablen ergänzt; `pipeline.yml`-Referenz auf `tests.yml`/`deploy.yml` korrigiert._ _(Deployment)_
- [x] 🟢 **E-Mail-Eindeutigkeit beim Update:** ~~Die Profil-Update-Action prüft die Eindeutigkeit des Nicknames, aber nicht der E-Mail.~~ _Erledigt (v0.7.5): neue `UserService.emailTakenByOtherUser(email, userId)` (erlaubt die eigene unveränderte E-Mail, blockt fremde) wird in der Update-Action vor `updateUser` geprüft._ _(Datenschutz)_
- [x] 🟢 **Fremdschlüssel-Casing:** ~~Der Workaround `event.UserId || (event as any).userId` deutet auf uneinheitliches FK-Casing hin.~~ _Erledigt (v0.7.5): Modelle definieren `UserId` explizit (Triad korrekt), die `as any`-Krücke an allen 5 Stellen entfernt (festivalEvent.attributes.ts 2×, festival-event.service.ts 2×, guest-information.service.ts 1×)._ _(Datenbank)_
- [x] 🟢 **API-Body vereinheitlichen:** ~~`join` liest `request.json()`, `cancel-invitation` dagegen `request.blob()` → `.text()`.~~ _Erledigt (v0.7.5): `cancel-invitation` nutzt jetzt JSON (`{ comment }`), Server liest `request.json()`, Client sendet `JSON.stringify({ comment })` – einheitlich mit `join`._ _(Datenbank)_
- [x] 🟢 **`alert()` ersetzen:** ~~Im Join-Fehlerpfad wird noch natives `alert()` genutzt.~~ _Erledigt (v0.7.5): beide `alert()`-Aufrufe (Fehler- und Netzwerkfehler-Pfad) durch den vorhandenen `InfoDialog` ersetzt._ _(UX)_
- [x] 🟢 **Bild-Store-Cache:** ~~`userImage.store.ts` hält eine modulweite `Map`, die nie geleert wird.~~ _Erledigt (v0.7.7): in einen beschränkten LRU-Cache umgebaut (`MAX_CACHED_IMAGES = 50`; zuletzt genutzter Eintrag wird neu einsortiert, überzählige älteste verworfen)._ _(Performance)_
- [x] 🟢 **Dialog-Vorbefüllung entkoppeln:** ~~Ein `$effect` synchronisiert laufend die Zu-/Absage-Dialogfelder aus abgeleiteten Gastdaten.~~ _Erledigt (v0.7.7): Dauer-`$effect` entfernt; die Felder werden jetzt einmalig beim Öffnen in `joinFestival`/`cancelInvitation` aus den aktuellen Gastdaten gesetzt (keine Überschreib-Race mehr)._ _(UX)_

## [M] Mittel (1–4h)

- [x] 🔴 **Cookie-Sicherheit (Flags):** ~~Verwendung von `HttpOnly`, `Secure` und `SameSite=Strict` Flags.~~ _Erledigt (v0.7.3): in `createSessionCookie` explizit `httpOnly: true`, `sameSite: 'strict'`, `secure: !dev` (an Build-Modus gekoppelt wegen localhost-E2E + Reverse-Proxy in Prod)._ Signierung siehe „Hook – JWT/HMAC" unten (aktuell durch DB-validierten Zufalls-Token abgesichert). _(Sicherheit)_
- [x] 🔴 **Access-Control:** ~~Kritische Aktionen und Routen serverseitig auf fehlende Zugriffsberechtigungen prüfen.~~ _Verifiziert (2026-07-09): alle mutierenden Flächen abgesichert – Festival löschen/bearbeiten (Owner via `isChangeAllowed`), join/cancel (self-scoped auf `user.id`), Gruppen löschen/verlassen (Owner/Self), Kommentar löschen/ändern (Autor `writtenBy`), Freundesanfrage annehmen (nur Empfänger). Kein Code-Change nötig. Verbleibende verwandte Punkte separat erfasst: Festival-Sichtbarkeit (unten, L) und `FrontendUser`-E-Mail-Leak (unten, M)._ _(Sicherheit)_
- [x] 🔴 **Session-Timeout:** ~~Einführung einer zeitlichen Begrenzung für Session-Token, um das Risiko von Session-Hijacking zu minimieren.~~ _Erledigt (v0.7.2): absolute Token-Lebensdauer `SESSION_MAX_AGE_MS` (30 Tage), serverseitige Prüfung via `isSessionTokenExpired` in `validateSessionToken`; abgelaufenes Token wird über den Auth-Hook ausgeloggt (DB-Cleanup)._ _(Sicherheit)_
- [x] 🔴 **Event-Logik:** ~~Sicherstellen, dass alle kritischen Aktionen (Teilnahme, etc.) autorisiert sind.~~ _Verifiziert (2026-07-09) im Zuge des Access-Control-Audits: Teilnahme (join/cancel) ist self-scoped, Bearbeiten/Löschen owner-gebunden. Details siehe Access-Control-Eintrag._ _(Festivals)_
- [x] 🔴 **N+1 Queries – Festival-Ersteller:** ~~`mapToFrontendFestivalEvent` lädt den Festival-Ersteller per separatem `UserService.loadFrontEndUserById()`-Call.~~ _Erledigt (v0.7.4): `getAllFestivals` lädt den Ersteller per Eager Loading (`include: { model: User, as: 'User' }`); `mapToFrontendFestivalEvent` liest ihn aus `event.User` (Fallback auf Einzel-Load nur noch bei `createFestival`, wo kein Include existiert)._ _(Performance)_
- [ ] 🟡 **Login-Schutz:** Implementierung von Rate-Limiting / Brute-Force-Schutz. _(Sicherheit)_
- [x] 🟡 **Passwortänderung härten:** ~~Die Änderung unter `/settings` verlangt weder das aktuelle Passwort noch ein Wiederholungsfeld.~~ _Erledigt (v0.7.11): Action verlangt `currentPassword` (Prüfung via `loginWithCredentials`) + `passwordRepeat` (Formvalidierung in `validatePasswordChange`, user.logic.ts, unit-getestet); nach Erfolg wird das Session-Token rotiert (`createSessionCookie` mit `forceNewToken`). E2E: Happy Path angepasst + Negativtest (falsches aktuelles Passwort)._ _(Sicherheit)_
- [x] 🟡 **`FrontendUser` leakt E-Mail:** ~~Das `FrontendUser`-Modell enthält `email` und wird an vielen Stellen an den Client serialisiert.~~ _Erledigt (v0.7.12): `email` aus `BaseUser`/`FrontendUser` entfernt (nur noch `BackendUser`, serverseitig) → alle eingebetteten Vorkommen (FriendRequestData, FrontendComment, Freundeslisten …) sind automatisch dicht. Eigenes Profil erhält die E-Mail separat über `UserTransferData.email` (`UserService.getEmailById`, nur bei `isOwnProfil`); `UserDataReadOnly` zeigt keine E-Mail mehr an._ _(Datenschutz)_
- [ ] 🟡 **Beziehungen:** Many-to-Many Implementierungen (besonders `Friendship`) und Kaskadenlöschungen verifizieren. _(Datenbank)_
- [x] 🟡 **N+1 Queries – Freundesliste:** ~~`getFriendList` und `convertToFriendRequest` laden User-Daten einzeln pro Eintrag.~~ _Erledigt (v0.7.13): `getFriendList` lädt alle Freunde mit EINEM Query (`UserService.loadFrontendUsersByIds`, WHERE id IN …); `getReceived-/getSentFriendRequests` laden `sender`/`receiver` per `include` mit, `convertToFriendRequest` liest bevorzugt die eager-geladenen Assoziationen (Fallback auf Einzel-Load ohne include)._ _(Performance)_
- [ ] 🟡 **Hook – JWT/HMAC:** Session-Token als signiertes JWT/HMAC implementieren, sodass kein DB-Lookup pro Request mehr nötig ist (statische Assets werden bereits übersprungen). _(Performance)_
- [ ] 🟡 **Backend-Logik:** Wichtige Geschäftslogik mit Unit- oder Integrationstests absichern. _(Testen)_
- [ ] 🟢 **E2E-Test-Isolation (Architektur):** Die Suite ist inzwischen zuverlässig grün (Hydration-Race-Flakiness behoben, siehe `openDialog`/`clickForResponse` in `test-utils.ts`). Weiterhin teilen sich alle Specs eine In-Memory-SQLite-DB (ein Dev-Server) und `comments.spec`/`settings.spec`/`friendship.spec` leeren sie global via `/api/test/reset`. Langfristig sauberer: pro Spec/Worker isolierte DB statt globalem Truncate. Beobachtete Rest-Flakes unter Suite-Last: verlorene Klicks vor Hydration (Logout inzwischen via `logout()`-Helper retry-fest, v0.7.12); einmalig „Gruppe bearbeiten“ (Name-Feld-Fill ging verloren, Beschreibung kam an) – bei Wiederauftreten das `openDialog`-Retry-Muster auf den Edit-Flow übertragen. _(Testen)_
- [ ] 🟡 **Error Handling:** Einheitliche Fehlermeldungen und klare Validierungs-Feedback im Frontend. _(UX)_
- [ ] 🟡 **Infrastruktur:** Backup-Konzept, HTTPS-Konfiguration und Start-/Restart-Verhalten im Zielsystem sicherstellen. _(Deployment)_
- [ ] 🟢 **Teilnehmer-Status:** Option "Vielleicht" für Teilnehmer anbieten. _(Festivals)_
- [ ] 🟢 **SessionToken:** Unterstützung mehrerer Sitzungen pro Benutzer auf DB-Ebene evaluieren. _(Datenbank)_
- [ ] 🟢 **Edge Cases:** Behandlung von leeren Zuständen. _(UX)_
- [ ] 🟢 **Monitoring:** Logging und Fehlertracking einrichten. _(Deployment)_
- [ ] 🟢 **`overrides` für `cookie`/`uuid` auflösen:** In `package.json` erzwingen zwei `overrides` gepatchte Transitiv-Versionen (`cookie → ^0.7.0` via `@sveltejs/kit`, `uuid → ^11.1.1` via `sequelize@6`), da es upstream keinen nicht-breaking Fix gibt. Sobald ein `@sveltejs/kit` mit `cookie ≥ 0.7` bzw. `sequelize 7` (nutzt `uuid` nativ, kein `^8` mehr) verfügbar ist, die zugehörigen Kernpakete anheben und die Overrides wieder entfernen. Danach `npm audit` + Build/Tests gegenprüfen. _(Datenbank)_

## [L] Groß (> 4h)

- [ ] 🟡 **Passwort-Management:** Definition von Passwort-Richtlinien (Komplexität) und Implementierung eines sicheren Passwort-Wiederherstellungsprozesses. _(Sicherheit)_
- [ ] 🟡 **Datenschutz:** Datenschutzhinweise prüfen, Löschkonzept für Accounts und Daten erstellen. _(Datenschutz)_
- [ ] 🟡 **Sichtbarkeit:** Festivals nur für Freunde oder Mitglieder von Gruppen zugänglich machen. _(Festivals)_
- [ ] 🟡 **Schema-Stabilität:** Echte Migrationsstrategie einführen. _Teilentschärft (v0.7.9): `sync({ alter: true })` → schlichtes `sync()` (kein automatisches Schema-Alter mehr, damit kein heuristischer Datenverlust in Prod). Offen bleibt der eigentliche Punkt: Sobald die Prod-DB befüllt ist, werden Modelländerungen NICHT mehr automatisch übernommen → dafür ein Migrations-Tool (z. B. umzug) einführen._ _(Datenbank)_
- [ ] 🟢 **Multiple Sitzungen:** Unterstützung für gleichzeitige Logins auf mehreren Geräten bei gleichzeitigem Schutz vor ungewollten Sitzungen. _(Sicherheit)_
- [ ] 🟢 **E2E-Tests:** Abdeckung von Login/Logout, Registrierung, Event-Teilnahme und Berechtigungen erweitern. _(Testen)_
- [ ] 🟢 **Bilder in der Datenbank:** User-Bilder werden als Base64-String direkt in der DB gespeichert (`src/lib/services/user.service.ts`). Bei vielen Nutzern belastet das die DB erheblich. Fix: Bilder im Dateisystem oder einem Object Storage ablegen und nur den Pfad in der DB speichern. _(Performance)_
