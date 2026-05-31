# TODO

Hier werden alle offenen Aufgaben für das Projekt gesammelt.

## Legende

| Priorität | Bedeutung |
|-----------|-----------|
| 🔴 Hoch   | Sicherheitsrisiko oder starke Beeinträchtigung der Nutzbarkeit |
| 🟡 Mittel | Wichtig für Qualität/Stabilität, aber kein akuter Handlungsbedarf |
| 🟢 Niedrig | Nice-to-have, technische Schulden oder Komfort-Features |

| Aufwand | Bedeutung |
|---------|-----------|
| S | Klein – wenige Zeilen, isolierte Änderung (< 1h) |
| M | Mittel – mehrere Dateien oder moderate Logik (1–4h) |
| L | Groß – Architekturänderung, viele Stellen betroffen (> 4h) |

---

### Authentifizierung & Sicherheit

- [ ] 🔴 **[M] Cookie-Sicherheit:** Verwendung von `HttpOnly`, `Secure` und `SameSite=Strict` Flags sowie Signierung von Cookies.
- [ ] 🔴 **[M] Access-Control:** Kritische Aktionen und Routen serverseitig auf fehlende Zugriffsberechtigungen prüfen.
- [ ] 🔴 **[M] Session-Timeout:** Einführung einer zeitlichen Begrenzung für Session-Token, um das Risiko von Session-Hijacking zu minimieren. Hinweis: `validateSessionToken` enthält bereits ein `// TODO Check token age`.
- [ ] 🟡 **[M] Login-Schutz:** Implementierung von Rate-Limiting / Brute-Force-Schutz.
- [ ] 🟡 **[L] Passwort-Management:** Definition von Passwort-Richtlinien (Komplexität) und Implementierung eines sicheren Passwort-Wiederherstellungsprozesses.
- [ ] 🟢 **[L] Multiple Sitzungen:** Unterstützung für gleichzeitige Logins auf mehreren Geräten bei gleichzeitigem Schutz vor ungewollten Sitzungen.

### Benutzerverwaltung & Datenschutz

- [ ] 🟡 **[L] Datenschutz:** Datenschutzhinweise prüfen, Löschkonzept für Accounts und Daten erstellen.

### Festivals & Events

- [ ] 🔴 **[M] Event-Logik:** Sicherstellen, dass alle kritischen Aktionen (Teilnahme, etc.) autorisiert sind.
- [ ] 🟡 **[L] Sichtbarkeit:** Festivals nur für Freunde oder Mitglieder von Gruppen zugänglich machen.
- [ ] 🟢 **[M] Teilnehmer-Status:** Option "Vielleicht" für Teilnehmer anbieten.

### Datenbank & Architektur

- [ ] 🟡 **[M] Beziehungen:** Many-to-Many Implementierungen (besonders `Friendship`) und Kaskadenlöschungen verifizieren.
- [ ] 🟡 **[L] Schema-Stabilität:** Migrationsstrategie statt reinem `alter-Sync` evaluieren.
- [ ] 🟢 **[M] SessionToken:** Unterstützung mehrerer Sitzungen pro Benutzer auf DB-Ebene evaluieren.

### Testen & Qualität

- [ ] 🟡 **[M] Backend-Logik:** Wichtige Geschäftslogik mit Unit- oder Integrationstests absichern.
- [ ] 🟢 **[L] E2E-Tests:** Abdeckung von Login/Logout, Registrierung, Event-Teilnahme und Berechtigungen erweitern.

### UX & Fehlerbehandlung

- [ ] 🟡 **[M] Error Handling:** Einheitliche Fehlermeldungen und klare Validierungs-Feedback im Frontend.
- [ ] 🟢 **[M] Edge Cases:** Behandlung von leeren Zuständen.

### Performance

- [ ] 🔴 **[M] N+1 Queries – Festival-Ersteller:** `mapToFrontendFestivalEvent` in `src/lib/db/attributes/festivalEvent.attributes.ts` lädt den Festival-Ersteller per separatem `UserService.loadFrontEndUserById()`-Call. Fix: User per Eager Loading (`include: [{ model: User, as: 'User' }]`) in `FestivalEvent.findAll()` / `FestivalEvent.findByPk()` mitladen und direkt aus `event.User` lesen.
- [ ] 🟡 **[M] N+1 Queries – Freundesliste:** `getFriendList` in `src/lib/services/friendship.service.ts` und `convertToFriendRequest` in `src/lib/db/attributes/friendRequest.attributes.ts` laden User-Daten einzeln pro Eintrag. Fix: `Friendship`/`FriendRequest` mit `include: [{ model: User }]` abfragen.
- [ ] 🟡 **[M] Hook – JWT/HMAC:** Session-Token als signiertes JWT/HMAC implementieren, sodass kein DB-Lookup pro Request mehr nötig ist (statische Assets werden bereits übersprungen).
- [ ] 🟢 **[L] Bilder in der Datenbank:** User-Bilder werden als Base64-String direkt in der DB gespeichert (`src/lib/services/user.service.ts`). Bei vielen Nutzern belastet das die DB erheblich. Fix: Bilder im Dateisystem oder einem Object Storage ablegen und nur den Pfad in der DB speichern.

### Deployment & Betrieb

- [ ] 🟡 **[S] Dokumentation:** Produktions-Umgebung (env) sauber dokumentieren.
- [ ] 🟡 **[M] Infrastruktur:** Backup-Konzept, HTTPS-Konfiguration und Start-/Restart-Verhalten im Zielsystem sicherstellen.
- [ ] 🟢 **[M] Monitoring:** Logging und Fehlertracking einrichten.
