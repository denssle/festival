# TODO

Hier werden alle offenen Aufgaben für das Projekt gesammelt.

### Authentifizierung
- [ ] **Token-Lebensdauer (Session Timeout):** Einführung einer zeitlichen Begrenzung für Session-Token, um das Risiko von Session-Hijacking zu minimieren.
- [ ] **Cookie-Sicherheit & Signierung:** Verwendung von `HttpOnly`, `Secure` und `SameSite=Strict` Flags sowie optionaler Signierung von Cookies.
- [ ] **Support für multiple Sitzungen:** Ermöglichung gleichzeitiger Logins auf mehreren Geräten bei gleichzeitigem Schutz vor ungewollten Sitzungen.
- [ ] **Brute-Force-Schutz:** Implementierung von Rate-Limiting bei Login-Versuchen.
- [ ] **Passwort-Richtlinien:** Definition von Passwort-Komplexitätsregeln.
- [ ] **Passwort-Reset:** Implementierung eines sicheren Passwort-Wiederherstellungsprozesses.

### Benutzerverwaltung
- [ ] **E-Mail Eindeutigkeit:** Überprüfung bei der Registrierung, ob die E-Mail-Adresse bereits vergeben ist.

### Festivals
- [ ] **Sichtbarkeit:** Festivals nur für Freunde oder Mitglieder von Gruppen zugänglich machen.
- [ ] **Teilnehmer-Status:** Bei Festivals die Option "Vielleicht" für Teilnehmer anbieten.

### Datenbank
- [ ] **Friendship:** Prüfung der Many-to-Many Implementierung (siehe `db.ts`).
- [ ] **SessionToken:** Unterstützung mehrerer Sitzungen pro Benutzer evaluieren.
