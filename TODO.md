# TODO

Hier werden alle offenen Aufgaben für das Projekt gesammelt.

### Authentifizierung & Sicherheit

- [ ] **Session-Timeout:** Einführung einer zeitlichen Begrenzung für Session-Token, um das Risiko von Session-Hijacking zu minimieren.
- [ ] **Cookie-Sicherheit:** Verwendung von `HttpOnly`, `Secure` und `SameSite=Strict` Flags sowie Signierung von Cookies.
- [ ] **Multiple Sitzungen:** Unterstützung für gleichzeitige Logins auf mehreren Geräten bei gleichzeitigem Schutz vor ungewollten Sitzungen.
- [ ] **Login-Schutz:** Implementierung von Rate-Limiting / Brute-Force-Schutz.
- [ ] **Passwort-Management:** Definition von Passwort-Richtlinien (Komplexität) und Implementierung eines sicheren Passwort-Wiederherstellungsprozesses.
- [ ] **Access-Control:** Kritische Aktionen und Routen serverseitig auf fehlende Zugriffsberechtigungen prüfen.

### Benutzerverwaltung & Datenschutz

- [ ] **Registrierung:** E-Mail-Eindeutigkeitsprüfung implementieren.
- [ ] **Datenschutz:** Datenschutzhinweise prüfen, Löschkonzept für Accounts und Daten erstellen.

### Festivals & Events

- [ ] **Sichtbarkeit:** Festivals nur für Freunde oder Mitglieder von Gruppen zugänglich machen.
- [ ] **Teilnehmer-Status:** Option "Vielleicht" für Teilnehmer anbieten.
- [ ] **Event-Logik:** Sicherstellen, dass alle kritischen Aktionen (Teilnahme, etc.) autorisiert sind.

### Datenbank & Architektur

- [ ] **Beziehungen:** Many-to-Many Implementierungen (besonders `Friendship`) und Kaskadenlöschungen verifizieren.
- [ ] **Schema-Stabilität:** Migrationsstrategie statt reinem `alter-Sync` evaluieren.
- [ ] **SessionToken:** Unterstützung mehrerer Sitzungen pro Benutzer auf DB-Ebene evaluieren.

### Testen & Qualität

- [ ] **E2E-Tests:** Abdeckung von Login/Logout, Registrierung, Event-Teilnahme und Berechtigungen erweitern.
- [ ] **Backend-Logik:** Wichtige Geschäftslogik mit Unit- oder Integrationstests absichern.

### UX & Fehlerbehandlung

- [ ] **Error Handling:** Einheitliche Fehlermeldungen und klare Validierungs-Feedback im Frontend.
- [ ] **Sicherheit:** Sicherstellen, dass bei Serverfehlern keine sensiblen Informationen an den Client gelangen.
- [ ] **Edge Cases:** Behandlung von leeren Zuständen.

### Deployment & Betrieb

- [ ] **Dokumentation:** Produktions-Umgebung (env) sauber dokumentieren.
- [ ] **Monitoring:** Logging und Fehlertracking einrichten.
- [ ] **Infrastruktur:** Backup-Konzept, HTTPS-Konfiguration und Start-/Restart-Verhalten im Zielsystem sicherstellen.
