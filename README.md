# Coole Webanwendung zur Planung privater Veranstaltungen

## Installation

- Erstelle eine `.env`-Datei für die Verbindung zu einer MariaDB. Sie sollte wie folgt aussehen:
- Der Datenbankname ist identisch mit dem Benutzernamen.
- Die Datenbank sollte unter `localhost:3306` laufen.

```
MARIA_DB_USER="***"
MARIA_DB_PASSWORD="***"
MARIA_DB_NAME="dev"
```

- Führe `npm install` aus.
- Führe `npm run dev` aus.
- Die Anwendung startet unter http://localhost:5173

## Deployment (Produktion)

Auf dem Produktionsserver (z. B. Uberspace) sollte die Anwendung wie folgt gestartet werden:

```bash
npm run start-server
```

Dieser Befehl stellt sicher, dass die Abhängigkeiten installiert sind und der Server unter dem konfigurierten Host erreichbar ist.

## KI-Assistent-Konfiguration

Dieses Projekt verwendet einen KI-Assistenten (wie Junie oder JetBrains AI) für die Entwicklung. Die Regeln und Richtlinien für den KI-Assistenten sind gespeichert in:

- `.aiassistant/guidelines.md`: Projektspezifische Architektur- und Codierungsstandards.
- `.aiassistant/rules/rules.md`: Aktive Regeln für den Assistenten.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Informationen findest du in der Datei [LICENSE.md](LICENSE.md).
