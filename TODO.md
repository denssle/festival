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

- [ ] 🟡 **Bild-Upload serverseitig validieren:** Der `POST /user-image`-Endpoint speichert den Base64-Body ungeprüft. Die 1-MB-Grenze und der Typ (`.png/.jpg`) werden nur clientseitig in `AvatarUpload.svelte` geprüft. Größe und MIME-Typ serverseitig validieren. _(Sicherheit)_
- [ ] 🟡 **Dokumentation:** Produktions-Umgebung (env) sauber dokumentieren. _(Deployment)_
- [ ] 🟢 **E-Mail-Eindeutigkeit beim Update:** Die Profil-Update-Action (`user/[user_id]/+page.server.ts`) prüft die Eindeutigkeit des Nicknames, aber nicht der E-Mail (`UserService.emailInvalid` existiert, wird bei Registrierung genutzt). Beim Ändern der E-Mail ebenfalls prüfen. _(Datenschutz)_
- [ ] 🟢 **Fremdschlüssel-Casing:** Der Workaround `event.UserId || (event as any).userId` (in `src/lib/db/attributes/festivalEvent.attributes.ts:26,49` und `src/lib/services/festival-event.service.ts:95,119`) deutet auf uneinheitliches FK-Casing hin. FK-Namen laut Triad-Regel eindeutig auf `UserId` festlegen und die `as any`-Krücke entfernen. _(Datenbank)_
- [ ] 🟢 **API-Body vereinheitlichen:** Der `join`-Endpoint liest `request.json()`, `cancel-invitation` dagegen `request.blob()` → `.text()` (Kommentar als Roh-Textbody). Auf ein einheitliches JSON-Format für beide Endpoints (inkl. Client in `festival/[festival_id]/+page.svelte`) umstellen. _(Datenbank)_
- [ ] 🟢 **`alert()` ersetzen:** In `src/routes/festival/[festival_id]/+page.svelte` (Join-Fehlerpfad) wird noch natives `alert()` genutzt. Durch den vorhandenen `InfoDialog` ersetzen, konsistent zum Rest der App. _(UX)_
- [ ] 🟢 **Bild-Store-Cache:** `src/lib/stores/userImage.store.ts` hält eine modulweite `Map<string, Writable>`, die auf dem Client nie geleert wird (wächst mit jedem betrachteten Profil). Cache-Größe begrenzen oder Einträge bei Bedarf invalidieren. _(Performance)_
- [ ] 🟢 **Dialog-Vorbefüllung entkoppeln:** In `festival/[festival_id]/+page.svelte` synchronisiert ein `$effect` laufend die Zu-/Absage-Dialogfelder (`bind:value`) aus abgeleiteten Gastdaten. Latent dieselbe Hydration-/Überschreib-Race wie in der Edit-Seite (nur unkritischer, da der Dialog erst auf Klick öffnet). Sauberer: die Felder **beim Öffnen** des Dialogs einmalig setzen statt via Dauer-Effect. _(UX)_

## [M] Mittel (1–4h)

- [ ] 🔴 **Cookie-Sicherheit:** Verwendung von `HttpOnly`, `Secure` und `SameSite=Strict` Flags sowie Signierung von Cookies. _(Sicherheit)_
- [ ] 🔴 **Access-Control:** Kritische Aktionen und Routen serverseitig auf fehlende Zugriffsberechtigungen prüfen. _(Sicherheit)_
- [ ] 🔴 **Session-Timeout:** Einführung einer zeitlichen Begrenzung für Session-Token, um das Risiko von Session-Hijacking zu minimieren. Hinweis: `validateSessionToken` enthält bereits ein `// TODO Check token age`. _(Sicherheit)_
- [ ] 🔴 **Event-Logik:** Sicherstellen, dass alle kritischen Aktionen (Teilnahme, etc.) autorisiert sind. _(Festivals)_
- [ ] 🔴 **N+1 Queries – Festival-Ersteller:** `mapToFrontendFestivalEvent` in `src/lib/db/attributes/festivalEvent.attributes.ts` lädt den Festival-Ersteller per separatem `UserService.loadFrontEndUserById()`-Call. Fix: User per Eager Loading (`include: [{ model: User, as: 'User' }]`) in `FestivalEvent.findAll()` / `FestivalEvent.findByPk()` mitladen und direkt aus `event.User` lesen. _(Performance)_
- [ ] 🟡 **Login-Schutz:** Implementierung von Rate-Limiting / Brute-Force-Schutz. _(Sicherheit)_
- [ ] 🟡 **Passwortänderung härten:** Die Änderung unter `/settings` verlangt weder das **aktuelle Passwort** (jede aktive Session kann das Passwort ändern) noch ein **Wiederholungsfeld** (Tippfehler sperrt den Account aus). Beides ergänzen; optional bei Änderung das Session-Token rotieren. _(Sicherheit)_
- [ ] 🟡 **`FrontendUser` leakt E-Mail:** Das `FrontendUser`-Modell enthält `email` und wird an vielen Stellen an den Client serialisiert (z. B. `/updates` via `FriendRequestData` → Absender-/Empfänger-E-Mail). Auf der Profilseite ist die E-Mail für fremde Profile bereits im Loader entfernt, der Rest (Updates, Kommentar-Autoren) fehlt noch. Ein öffentliches User-Modell ohne `email` einführen und nur beim eigenen Profil die E-Mail ausliefern. _(Datenschutz)_
- [ ] 🟡 **Beziehungen:** Many-to-Many Implementierungen (besonders `Friendship`) und Kaskadenlöschungen verifizieren. _(Datenbank)_
- [ ] 🟡 **N+1 Queries – Freundesliste:** `getFriendList` in `src/lib/services/friendship.service.ts` und `convertToFriendRequest` in `src/lib/db/attributes/friendRequest.attributes.ts` laden User-Daten einzeln pro Eintrag. Fix: `Friendship`/`FriendRequest` mit `include: [{ model: User }]` abfragen. _(Performance)_
- [ ] 🟡 **Hook – JWT/HMAC:** Session-Token als signiertes JWT/HMAC implementieren, sodass kein DB-Lookup pro Request mehr nötig ist (statische Assets werden bereits übersprungen). _(Performance)_
- [ ] 🟡 **Backend-Logik:** Wichtige Geschäftslogik mit Unit- oder Integrationstests absichern. _(Testen)_
- [ ] 🟢 **E2E-Test-Isolation (Architektur):** Die Suite ist inzwischen zuverlässig grün (Hydration-Race-Flakiness behoben, siehe `openDialog`/`clickForResponse` in `test-utils.ts`). Weiterhin teilen sich alle Specs eine In-Memory-SQLite-DB (ein Dev-Server) und `comments.spec`/`settings.spec`/`friendship.spec` leeren sie global via `/api/test/reset`. Langfristig sauberer: pro Spec/Worker isolierte DB statt globalem Truncate. _(Testen)_
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
- [ ] 🟡 **Schema-Stabilität:** Migrationsstrategie statt reinem `alter-Sync` evaluieren. _(Datenbank)_
- [ ] 🟢 **Multiple Sitzungen:** Unterstützung für gleichzeitige Logins auf mehreren Geräten bei gleichzeitigem Schutz vor ungewollten Sitzungen. _(Sicherheit)_
- [ ] 🟢 **E2E-Tests:** Abdeckung von Login/Logout, Registrierung, Event-Teilnahme und Berechtigungen erweitern. _(Testen)_
- [ ] 🟢 **Bilder in der Datenbank:** User-Bilder werden als Base64-String direkt in der DB gespeichert (`src/lib/services/user.service.ts`). Bei vielen Nutzern belastet das die DB erheblich. Fix: Bilder im Dateisystem oder einem Object Storage ablegen und nur den Pfad in der DB speichern. _(Performance)_
