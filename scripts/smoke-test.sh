#!/usr/bin/env bash
#
# Produktions-Smoke-Test: startet das GEBAUTE Artefakt (build/) so, wie es der
# Supervisor auf dem Uberspace startet, gegen eine echte MariaDB.
#
# Motivation: Die Playwright-Suite laeuft ueber PLAYWRIGHT=true gegen In-Memory-SQLite
# und fasst damit weder `node build` noch den MariaDB-Zweig von startDB() an. Drei
# Produktionsausfaelle in Folge (v0.7.25 bis v0.7.28) waeren hier sofort aufgefallen:
#
#   1. .env wurde von `node build` nicht geladen  -> Szenario 1 (Start ueberhaupt)
#   2. Credential-Guard brach den Build ab        -> `npm run build` in der Pipeline
#   3. Baseline lief gegen bestehendes Schema     -> Szenario 2 (Bestands-DB)
#
# Voraussetzungen: erreichbare MariaDB, gebautes build/, `mysql`-Client im PATH.
# Lokal z. B. mit:
#   docker run -d --rm -p 3306:3306 -e MARIADB_ROOT_PASSWORD=root \
#     -e MARIADB_DATABASE=festival_prod -e MARIADB_USER=festival \
#     -e MARIADB_PASSWORD=festivalpw --name festival-smoke mariadb:11
#   npm run build && bash scripts/smoke-test.sh

set -euo pipefail

# Der effektive DB-Name ist MARIA_DB_USER + '_' + MARIA_DB_NAME (siehe sequelize.ts),
# hier also "festival_prod". MARIA_DB_NAME darf NICHT 'dev' sein, sonst schaltet die
# App auf In-Memory-SQLite um und der Test wuerde nichts pruefen.
DB_USER="${MARIA_DB_USER:-festival}"
DB_PASSWORD="${MARIA_DB_PASSWORD:-festivalpw}"
DB_NAME="${MARIA_DB_NAME:-prod}"
DB_HOST="${DB_HOST:-127.0.0.1}"
FULL_DB_NAME="${DB_USER}_${DB_NAME}"
HEALTH_URL="http://localhost:5173/api/health"

server_pid=""
env_backup=""

cleanup() {
	# Nur beenden, nicht auf den Port warten: cleanup laeuft im EXIT-Trap, ein
	# fail() von dort waere wenig hilfreich und wuerde den echten Fehler verdecken.
	kill_server
	# Eine lokal vorhandene .env unbedingt zurueckspielen - der Test schreibt eine
	# eigene und wuerde die Entwicklungs-Konfiguration sonst zerstoeren.
	if [[ -n "$env_backup" && -f "$env_backup" ]]; then
		mv -f "$env_backup" .env
		echo "==> Vorhandene .env wiederhergestellt."
	fi
}
trap cleanup EXIT

fail() {
	echo "FEHLGESCHLAGEN: $*" >&2
	echo "--- Serverlog ---" >&2
	cat smoke-server.log >&2 || true
	exit 1
}

mysql_exec() {
	mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$FULL_DB_NAME" -e "$1"
}

start_server() {
	# Bewusst ueber `npm run start-server` - genau das Kommando, das der Supervisor
	# ausfuehrt, inklusive --env-file=.env. Ein Fehler darin faellt so hier auf.
	# Angehaengt (>>), damit das Log beider Szenarien im Artefakt erhalten bleibt.
	echo "--- Serverstart ---" >> smoke-server.log
	# setsid gibt dem Server eine eigene Prozessgruppe (PGID = PID), damit unten die
	# GANZE Gruppe beendet werden kann - npm startet node ueber eine sh-Zwischenschicht,
	# node ist also ein Enkel und ueberlebt ein `pkill -P` auf den npm-Prozess.
	if command -v setsid > /dev/null 2>&1; then
		setsid npm run start-server >> smoke-server.log 2>&1 &
	else
		npm run start-server >> smoke-server.log 2>&1 &
	fi
	server_pid=$!
}

# Beendet den Server samt Kindern. Nur den npm-Wrapper zu killen reicht nicht: node
# laeuft als Enkel weiter, haelt Port 5173 und der naechste Start scheitert mit
# EADDRINUSE. Deshalb erst die Prozessgruppe (negative PID), dann die Einzelprozesse,
# zuletzt ein Fallback auf das Startkommando selbst.
kill_server() {
	if [[ -n "$server_pid" ]]; then
		kill -- -"$server_pid" 2>/dev/null || true
		pkill -P "$server_pid" 2>/dev/null || true
		kill "$server_pid" 2>/dev/null || true
		wait "$server_pid" 2>/dev/null || true
		server_pid=""
	fi
	pkill -f "node --env-file=.env build" 2>/dev/null || true
}

# Beenden und sicherstellen, dass der Port wirklich frei ist, bevor neu gestartet wird.
stop_server() {
	kill_server
	wait_for_port_free
}

# Wartet, bis auf Port 5173 nichts mehr antwortet. Bewusst `curl` OHNE --fail: Ein
# laufender Server, der 503 meldet, ist ebenfalls "belegt" - mit --fail wuerde er
# faelschlich als beendet gelten.
wait_for_port_free() {
	local attempt
	for attempt in $(seq 1 20); do
		if ! curl -s -o /dev/null "$HEALTH_URL" 2>/dev/null; then
			return 0
		fi
		sleep 1
	done
	fail "Port 5173 ist noch belegt - der vorherige Serverprozess laeuft weiter"
}

# Wartet auf HTTP 200 von /api/health. Bricht sofort ab, wenn der Serverprozess
# bereits gestorben ist - sonst laeuft der Test sinnlos ins Timeout.
wait_for_health() {
	local attempt
	for attempt in $(seq 1 40); do
		if ! kill -0 "$server_pid" 2>/dev/null; then
			fail "Serverprozess ist beendet (nach ~$((attempt * 2))s)"
		fi
		if curl -fsS "$HEALTH_URL" > smoke-health.json 2>/dev/null; then
			echo "  bereit nach ~$((attempt * 2))s: $(cat smoke-health.json)"
			return 0
		fi
		sleep 2
	done
	fail "/api/health wurde nicht bereit"
}

# Prueft ein Feld der Health-Antwort ohne jq (im Runner nicht garantiert vorhanden).
assert_health_field() {
	local field="$1" expected="$2" body
	body="$(cat smoke-health.json)"
	if [[ "$body" != *"\"${field}\":${expected}"* ]]; then
		fail "Health-Antwort: erwartet ${field}=${expected}, war: ${body}"
	fi
}

if [[ -f .env ]]; then
	env_backup="$(mktemp)"
	cp .env "$env_backup"
	echo "==> Vorhandene .env gesichert (wird am Ende zurueckgespielt)."
fi

echo "==> .env schreiben (wird von 'node --env-file=.env build' gelesen)"
cat > .env <<EOF
MARIA_DB_USER="${DB_USER}"
MARIA_DB_PASSWORD="${DB_PASSWORD}"
MARIA_DB_NAME="${DB_NAME}"
EOF

# Frisches Log, damit die Pruefungen unten nicht auf Treffer eines frueheren Laufs
# hereinfallen (im CI immer frisch, lokal nicht zwingend).
: > smoke-server.log

echo "==> Szenario 1: frische Datenbank, Schema kommt aus den Migrationen"
start_server
wait_for_health
assert_health_field "status" '"ok"'
# Beweist, dass wirklich MariaDB benutzt wurde und nicht still SQLite (die Falle aus
# CLAUDE.md, Abschnitt 6) - sonst wuerde der Test faelschlich gruen melden.
assert_health_field "dialect" '"mariadb"'
assert_health_field "pendingMigrations" '0'

if ! grep -q "SequelizeMeta" smoke-server.log; then
	fail "Migrationslauf nicht im Log - lief die App wirklich ueber den MariaDB-Zweig?"
fi

echo "==> Szenario 2: Bestands-DB aus der sync()-Zeit (Schema da, kein Protokoll)"
stop_server
# Genau der Produktionszustand: Tabellen und Unique-Indizes stehen, SequelizeMeta
# fehlt. Ohne Baseline-Stempel bricht der Start hier mit "Duplicate key name" ab.
mysql_exec "DROP TABLE SequelizeMeta;"

start_server
wait_for_health
assert_health_field "status" '"ok"'
assert_health_field "pendingMigrations" '0'

if ! grep -q "ohne Migrationsprotokoll erkannt" smoke-server.log; then
	fail "Baseline wurde nicht gestempelt - stampBaselineIfLegacySchema() hat nicht gegriffen"
fi

echo "==> Beide Szenarien bestanden."
