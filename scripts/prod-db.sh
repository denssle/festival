#!/usr/bin/env bash
#
# Abfragen gegen die PRODUKTIONS-Datenbank auf dem Uberspace.
#
# Warum dieses Skript und nicht einfach `mysql` auf dem Host: Der mysql-Client
# kommt dort mit den Zugangsdaten aus ~/festival-app/.env nicht durch (Access
# denied, Fehler 1045 - ueber den Unix-Socket wie ueber TCP), obwohl die App
# sich mit exakt denselben Werten verbindet. Ursache ist die Shell: `source`
# interpretiert den Wert (Expansion von $, Backslashes), `node --env-file`
# nimmt ihn literal. Dieses Skript geht deshalb denselben Weg wie die App -
# node mit --env-file plus dem mariadb-Treiber aus ~/festival-app/node_modules.
#
# Verwendung:
#   scripts/prod-db.sh                          # Kurzuebersicht (Zeilen je Tabelle)
#   scripts/prod-db.sh "SELECT nickname FROM users"
#   scripts/prod-db.sh --json "SELECT * FROM festivalEvents"
#   scripts/prod-db.sh --write "DELETE FROM comments WHERE id='...'"
#
# Ohne --write sind nur lesende Statements erlaubt (SELECT/SHOW/DESCRIBE/EXPLAIN).
# Das ist eine Bremse gegen Vertipper auf der Produktionsdatenbank, kein
# Sicherheitsmechanismus.
#
# Konfiguration ueber Umgebungsvariablen (Defaults in Klammern):
#   UBERSPACE_USER    (enzlor)
#   UBERSPACE_HOST    (enzlor.uber.space)
#   UBERSPACE_SSH_KEY (erster Treffer von ~/sync/Sonstiges/Schlüssel/ssh-keys/*uberspace)
#   APP_DIR           ($HOME/festival-app, auf dem HOST ausgewertet)

set -euo pipefail

USER_NAME="${UBERSPACE_USER:-enzlor}"
HOST="${UBERSPACE_HOST:-enzlor.uber.space}"
REMOTE_APP_DIR="${APP_DIR:-festival-app}"

if [ -n "${UBERSPACE_SSH_KEY:-}" ]; then
	KEY="$UBERSPACE_SSH_KEY"
else
	# Der Dateiname enthaelt verirrte Escape-Zeichen, deshalb per Glob ansprechen.
	KEY=$(ls "$HOME"/sync/Sonstiges/Schlüssel/ssh-keys/*uberspace 2>/dev/null | grep -v '\.pub$' | head -1 || true)
fi

if [ -z "$KEY" ] || [ ! -f "$KEY" ]; then
	echo "Kein SSH-Key gefunden. Per UBERSPACE_SSH_KEY einen Pfad angeben." >&2
	exit 1
fi

ALLOW_WRITE=0
FORMAT="table"
while [ $# -gt 0 ]; do
	case "$1" in
		--write)
			ALLOW_WRITE=1
			shift
			;;
		--json)
			FORMAT="json"
			shift
			;;
		-h | --help)
			sed -n '2,28p' "$0" | sed 's/^#\{0,1\} \{0,1\}//'
			exit 0
			;;
		*) break ;;
	esac
done

QUERY="${1:-__COUNTS__}"

if [ "$QUERY" != "__COUNTS__" ] && [ "$ALLOW_WRITE" -eq 0 ]; then
	FIRST_WORD=$(printf '%s' "$QUERY" | sed 's/^[[:space:]]*//' | cut -d' ' -f1 | tr '[:upper:]' '[:lower:]')
	case "$FIRST_WORD" in
		select | show | describe | desc | explain) ;;
		*)
			echo "Nur lesende Statements ohne --write (gelesen: '$FIRST_WORD')." >&2
			exit 2
			;;
	esac
fi

# Das JS wird base64-kodiert uebertragen. Ein verschachteltes Heredoc durch SSH
# hindurch zu quoten ist zu fragil - jede Expansion unterwegs zerlegt den Code.
read -r -d '' REMOTE_JS <<'JS' || true
const mod = await import('mariadb');
const mariadb = mod.default ?? mod;

const conn = await mariadb.createConnection({
	host: 'localhost',
	user: process.env.MARIA_DB_USER,
	password: process.env.MARIA_DB_PASSWORD,
	database: process.env.MARIA_DB_USER + '_' + process.env.MARIA_DB_NAME
});

// BigInt (COUNT, BIGINT-Spalten) ist nicht JSON-faehig und wuerde beim Ausgeben
// werfen; BLOBs (Profilbilder) will hier niemand als Bytefolge sehen.
const plain = (v) => {
	if (typeof v === 'bigint') return Number(v);
	if (Buffer.isBuffer(v)) return `<${v.length} bytes>`;
	if (v instanceof Date) return v.toISOString();
	return v;
};

try {
	if (process.env.SQL_QUERY === '__COUNTS__') {
		const tables = await conn.query('SHOW TABLES');
		for (const row of tables) {
			const name = Object.values(row)[0];
			const r = await conn.query('SELECT COUNT(*) AS n FROM `' + name + '`');
			console.log(String(name).padEnd(20), Number(r[0].n));
		}
	} else {
		const rows = await conn.query(process.env.SQL_QUERY);
		if (!Array.isArray(rows)) {
			// Schreibende Statements liefern kein Ergebnis-Array, sondern Metadaten
			console.log(JSON.stringify(rows, (k, v) => plain(v)));
		} else if (rows.length === 0) {
			console.log('(keine Zeilen)');
		} else if (process.env.OUT_FORMAT === 'json') {
			const mapped = rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, plain(v)])));
			console.log(JSON.stringify(mapped, null, 2));
		} else {
			const cols = Object.keys(rows[0]);
			const width = {};
			for (const c of cols) {
				width[c] = Math.max(c.length, ...rows.map((r) => String(plain(r[c]) ?? '').length));
			}
			console.log(cols.map((c) => c.padEnd(width[c])).join('  '));
			console.log(cols.map((c) => '-'.repeat(width[c])).join('  '));
			for (const r of rows) {
				console.log(cols.map((c) => String(plain(r[c]) ?? '').padEnd(width[c])).join('  '));
			}
			console.log('(' + rows.length + ' Zeilen)');
		}
	}
} finally {
	await conn.end();
}
JS

JS_B64=$(printf '%s' "$REMOTE_JS" | base64 | tr -d '\n')
QUERY_B64=$(printf '%s' "$QUERY" | base64 | tr -d '\n')

ssh -i "$KEY" -o BatchMode=yes "${USER_NAME}@${HOST}" \
	"export JS_B64='${JS_B64}' SQL_B64='${QUERY_B64}' OUT_FORMAT='${FORMAT}' REMOTE_APP_DIR='${REMOTE_APP_DIR}'; bash -s" <<'OUTER'
set -eu
cd "$HOME/$REMOTE_APP_DIR" 2>/dev/null || cd "$REMOTE_APP_DIR" || {
	echo "App-Verzeichnis nicht gefunden: $REMOTE_APP_DIR" >&2
	exit 1
}
# Code per Pipe an node statt als Datei: Eine Datei in /tmp wuerde `mariadb`
# nicht finden, weil Node Module vom Pfad der Datei aus aufloest - bei stdin
# dagegen vom Arbeitsverzeichnis, und das ist hier ~/festival-app.
SQL_QUERY="$(printf '%s' "$SQL_B64" | base64 -d)" \
	sh -c 'printf "%s" "$JS_B64" | base64 -d | node --env-file=.env --input-type=module'
OUTER
