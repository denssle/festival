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
#                                                    (Schema: scripts/smoke-legacy-schema.sql)
#
# Szenario 3 prueft danach echte Ablaeufe gegen Build + MariaDB - Verhalten, das weder
# `vite dev` noch SQLite zeigen: das Upload-Limit von adapter-node (BODY_SIZE_LIMIT, im
# Dev-Server gibt es keins) und die Spaltengrenzen von MariaDB (VARCHAR(255) vs. TEXT,
# SQLite erzwingt keine Laengen).
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
HEALTH_URL="http://localhost:5173/festival/api/health"

server_pid=""
env_backup=""
cookie_jar=""
avatar_file=""

cleanup() {
	# Nur beenden, nicht auf den Port warten: cleanup laeuft im EXIT-Trap, ein
	# fail() von dort waere wenig hilfreich und wuerde den echten Fehler verdecken.
	kill_server
	rm -f "$cookie_jar" "$avatar_file"
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

# Einzelwert/Tabelle ohne Kopfzeile, fuer Vergleiche im Skript.
mysql_value() {
	mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$FULL_DB_NAME" -N -e "$1"
}

# Leert die Datenbank (alle Tabellen). DROP DATABASE ginge schneller, darf der
# App-Benutzer aber nicht zwingend.
drop_all_tables() {
	local tables
	tables=$(mysql_value "SELECT GROUP_CONCAT(CONCAT('\`', TABLE_NAME, '\`')) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()")
	if [[ -n "$tables" && "$tables" != "NULL" ]]; then
		mysql_exec "SET FOREIGN_KEY_CHECKS = 0; DROP TABLE ${tables}; SET FOREIGN_KEY_CHECKS = 1;"
	fi
}

# Constraints der Migrationen 0003/0004 - in MariaDB selbst nachgesehen, weil genau hier
# ein stiller Unterschied zu SQLite droht: SQLite bekommt die CHECKs gar nicht, und ein
# FK, der nicht angelegt wird, faellt erst auf, wenn beim Loeschen Waisen liegen bleiben.
assert_schema_constraints() {
	local cascades check
	cascades=$(mysql_value "SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'comments' AND DELETE_RULE = 'CASCADE'")
	if [[ "$cascades" != "3" ]]; then
		fail "comments: erwartet 3 FKs mit ON DELETE CASCADE (writtenBy, FestivalEventId, ProfileUserId), gefunden: ${cascades}"
	fi
	check=$(mysql_value "SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'comments_genau_ein_ziel'")
	if [[ "$check" != "1" ]]; then
		fail "comments: CHECK-Constraint comments_genau_ein_ziel fehlt"
	fi
	check=$(mysql_value "SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'guest_informations_answer_gueltig'")
	if [[ "$check" != "1" ]]; then
		fail "guestInformations: CHECK-Constraint guest_informations_answer_gueltig fehlt"
	fi
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

APP_URL="http://localhost:5173/festival"

# Origin, den ein Browser in Produktion schickt. Er steht in csrf.trustedOrigins
# (svelte.config.js) - ohne passenden Origin lehnt der Build Formular-POSTs mit 403 ab.
PROD_ORIGIN="https://enzlor.uber.space"

# HTTP-Request mit Session-Cookie; gibt nur den Statuscode aus, der Body landet in
# smoke-response.txt. Origin wie im Browser in Produktion (siehe PROD_ORIGIN). `Accept: text/html`
# wie bei einem echten Formular-Submit: Ohne ihn (curl schickt */*) haelt SvelteKit den
# Aufruf fuer einen use:enhance-Fetch und antwortet auf Form-Actions mit JSON und 200
# statt mit dem echten Redirect bzw. Fehlerstatus.
http() {
	curl -s -o smoke-response.txt -w '%{http_code}' -b "$cookie_jar" -c "$cookie_jar" \
		-H "Origin: ${PROD_ORIGIN}" -H "Accept: text/html" "$@"
}

expect_status() {
	local expected="$1" actual="$2" what="$3"
	if [[ "$actual" != "$expected" ]]; then
		fail "${what}: HTTP ${actual} statt ${expected}. Antwort: $(head -c 300 smoke-response.txt 2>/dev/null)"
	fi
}

# Zeichenkette aus n gleichen Zeichen (ohne GNU-Eigenheiten).
repeat_char() {
	head -c "$2" /dev/zero | tr '\0' "$1"
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

# Sortierung wie auf dem Uberspace (dort Server- und DB-Standard, per SELECT
# @@collation_database nachgesehen). Neue Tabellen erben sie, ohne dass die Migrationen
# sie nennen - so entsteht hier dasselbe Schema wie in Produktion.
mysql_exec "ALTER DATABASE \`${FULL_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

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
assert_schema_constraints

echo "==> Szenario 2: Bestands-DB aus der sync()-Zeit (Baseline-Schema, kein Protokoll)"
stop_server
# Genau der Produktionszustand vor v0.7.24: Tabellen und Unique-Indizes stehen,
# SequelizeMeta fehlt. Ohne Baseline-Stempel bricht der Start hier mit "Duplicate key
# name" ab. Das Schema kommt aus einer eingefrorenen Datei, nicht aus Szenario 1 - dessen
# Schema ist schon auf dem neuesten Stand, und alle Migrationen nach der Baseline liefen
# sonst ein zweites Mal darueber (Migration 0003 liest eine Spalte, die es dann nicht
# mehr gibt). Dazu Altdaten, damit die Datenuebernahme gegen echte MariaDB laeuft.
drop_all_tables
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$FULL_DB_NAME" < scripts/smoke-legacy-schema.sql

start_server
wait_for_health
assert_health_field "status" '"ok"'
assert_health_field "pendingMigrations" '0'

if ! grep -q "ohne Migrationsprotokoll erkannt" smoke-server.log; then
	fail "Baseline wurde nicht gestempelt - stampBaselineIfLegacySchema() hat nicht gegriffen"
fi
assert_schema_constraints

# Migration 0003: writtenTo der richtigen Spalte zugeordnet, die Waise verworfen.
migrated=$(mysql_value "SELECT id, IFNULL(FestivalEventId, '-'), IFNULL(ProfileUserId, '-') FROM comments ORDER BY id")
expected=$'legacy-c-festival\tlegacy-festival\t-\nlegacy-c-profil\t-\tlegacy-owner'
if [[ "$migrated" != "$expected" ]]; then
	fail "Kommentare nach Migration 0003 falsch zugeordnet. Erwartet:\n${expected}\nWar:\n${migrated}"
fi

# Migration 0004: coming (Boolean) -> answer.
migrated=$(mysql_value "SELECT id, answer FROM guestInformations ORDER BY id")
expected=$'legacy-g-absage\tno\nlegacy-g-zusage\tyes'
if [[ "$migrated" != "$expected" ]]; then
	fail "Zu-/Absagen nach Migration 0004 falsch uebernommen. Erwartet:\n${expected}\nWar:\n${migrated}"
fi

echo "==> Szenario 3: Ablaeufe gegen Build + MariaDB"
cookie_jar="$(mktemp)"
nickname="smoke_$(date +%s)"

echo "  Registrierung"
status=$(http -d "nickname=${nickname}" -d "password=SmokeTest123!" -d "password2=SmokeTest123!" \
	"${APP_URL}/registration")
expect_status 302 "$status" "Registrierung"
# curl sendet Secure-Cookies seit 7.79 auch an http://localhost - sonst waere die Session hier weg.
if ! grep -q "session" "$cookie_jar"; then
	fail "Registrierung hat kein Session-Cookie gesetzt"
fi

# CSRF (seit v0.7.64): Formular von fremder Seite muss abgewiesen werden. Laeuft nur hier -
# SvelteKit prueft den Origin nur im Build, Playwright (vite dev) sieht davon nichts.
echo "  CSRF: Formular von fremder Seite"
status=$(curl -s -o smoke-response.txt -w '%{http_code}' -b "$cookie_jar" \
	-H "Origin: https://boese.example" -H "Accept: text/html" -d "name=CSRF" "${APP_URL}/festival/new")
expect_status 403 "$status" "Formular-POST mit fremdem Origin"

echo "  Festival anlegen"
status=$(http -D smoke-headers.txt -d "name=Smoke-Festival" -d "description=$(repeat_char d 1000)" \
	"${APP_URL}/festival/new")
expect_status 302 "$status" "Festival anlegen"
festival_id=$(grep -i '^location:' smoke-headers.txt | grep -oE '[0-9a-f]{8}-[0-9a-f-]{27}' || true)
if [[ -z "$festival_id" ]]; then
	fail "Keine Festival-ID im Redirect: $(grep -i '^location:' smoke-headers.txt)"
fi

# Die VARCHAR-Falle (v0.7.55): Freitext ueber 255 Zeichen muss in MariaDB passen
# (TEXT-Spalte), ein zu langer Kurztext muss als 422 abgelehnt werden - nicht als 500
# ("Data too long"), wie vor der Laengenpruefung.
echo "  Kommentar mit 1000 Zeichen"
status=$(http -F "comment=$(repeat_char c 1000)" "${APP_URL}/festival/${festival_id}/comments")
expect_status 200 "$status" "Kommentar mit 1000 Zeichen"

# Migration 0003: Der FK lehnt Kommentare an Ziele ab, die es nicht gibt.
echo "  Kommentar an ein nicht existierendes Festival"
status=$(http -F "comment=Hallo" "${APP_URL}/festival/00000000-0000-0000-0000-000000000000/comments")
expect_status 422 "$status" "Kommentar an nicht existierendes Festival"

# Migration 0004: Der CHECK auf answer muss 'maybe' durchlassen.
echo "  Antwort \"vielleicht\""
status=$(http -H "Content-Type: application/json" -d '{"comment":"wenn es klappt"}' \
	"${APP_URL}/festival/${festival_id}/maybe")
expect_status 200 "$status" "Antwort vielleicht"
answer=$(mysql_value "SELECT answer FROM guestInformations WHERE FestivalEventId = '${festival_id}'")
if [[ "$answer" != "maybe" ]]; then
	fail "Antwort vielleicht nicht gespeichert (war: ${answer})"
fi

echo "  Zu langer Festivalname"
status=$(http -d "name=$(repeat_char n 256)" "${APP_URL}/festival/new")
expect_status 422 "$status" "Festivalname mit 256 Zeichen"

stored=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$FULL_DB_NAME" -N -e \
	"SELECT CHAR_LENGTH(c.comment), CHAR_LENGTH(f.description) FROM comments c JOIN festivalEvents f ON f.id = c.FestivalEventId WHERE f.id = '${festival_id}'")
if [[ "$stored" != $'1000\t1000' ]]; then
	fail "Texte nicht vollstaendig gespeichert (erwartet 1000/1000, war: ${stored})"
fi

# BODY_SIZE_LIMIT: adapter-node lehnt ohne die Variable alles ueber 512 KB ab, im
# Dev-Server gibt es gar kein Limit. Ein Avatar an der 1-MiB-Grenze ist als Base64-Data-URI
# rund 1,4 MB gross - genau der Fall, der in Produktion sonst erst beim Nutzer auffiele.
echo "  Avatar-Upload an der 1-MiB-Grenze (~1,4 MB Request)"
avatar_file="$(mktemp)"
# 1.398.100 Base64-Zeichen = 1.048.575 Bytes, knapp unter MAX_IMAGE_BYTES (image.logic.ts)
{ printf 'data:image/png;base64,'; repeat_char A 1398100; } > "$avatar_file"
status=$(http -H "Content-Type: text/plain" --data-binary "@${avatar_file}" "${APP_URL}/user-image")
expect_status 200 "$status" "Avatar-Upload (~1,4 MB)"

status=$(http "${APP_URL}/user-image")
expect_status 200 "$status" "Avatar abrufen"
if ! cmp -s smoke-response.txt "$avatar_file"; then
	fail "Abgerufener Avatar weicht vom hochgeladenen ab ($(wc -c < smoke-response.txt) statt $(wc -c < "$avatar_file") Bytes)"
fi

echo "==> Alle drei Szenarien bestanden."
