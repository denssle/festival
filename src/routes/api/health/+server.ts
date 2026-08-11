import { sequelize } from '$lib/db/sequelize';
import { createMigrator } from '$lib/db/migrations';

/** Antwortkörper von GET /api/health. */
interface HealthResponse {
	status: 'ok' | 'error';
	/** Version aus package.json – zeigt, ob ein Deploy tatsächlich angekommen ist. */
	version: string;
	dialect: string;
	/** Nur im MariaDB-Zweig gefüllt: Anzahl noch nicht ausgeführter Migrationen. */
	pendingMigrations?: number;
}

/**
 * GET /api/health
 *
 * Readiness-Check: prüft nicht nur, dass der Node-Prozess lauscht, sondern dass die
 * Datenbank tatsächlich benutzbar ist (`SELECT 1`) und das Schema aktuell ist.
 *
 * Hintergrund: Der Deploy-Health-Check lief früher gegen `/`. Diese Route fasst ohne
 * Session-Cookie gar keine DB an (siehe UserService.getCurrentUserBySessionToken) und
 * antwortete darum auch bei toter Datenbank mit 200 – ein Ausfall blieb dadurch
 * unbemerkt (v0.7.25). Dieser Endpunkt schließt genau diese Lücke.
 *
 * Bewusst ohne Auth erreichbar (Eintrag in `noAuthURLs` in hooks.server.ts), damit der
 * Check ohne Anmeldung funktioniert. Fehlerdetails gehen deshalb NUR ins Server-Log –
 * die Antwort nach außen bleibt generisch, da DB-Fehler Benutzernamen und Hostnamen
 * enthalten können.
 *
 * @returns 200 mit { status: 'ok', … } wenn die DB antwortet und keine Migration aussteht,
 *          503 mit { status: 'error', … } sonst
 */
export async function GET(): Promise<Response> {
	const body: HealthResponse = {
		status: 'ok',
		version: process.env.npm_package_version ?? 'unknown',
		dialect: sequelize.getDialect()
	};

	try {
		// authenticate() setzt ein echtes `SELECT 1+1 AS result` ab, ist also ein
		// vollwertiger Roundtrip zur DB. Bewusst KEIN eigenes sequelize.query('SELECT 1'):
		// Das bricht auf MariaDB in Sequelizes formatResults mit "Cannot delete property
		// 'meta' of [object Array]" ab, weil der mariadb-Treiber das Ergebnis-Array mit
		// einer nicht löschbaren meta-Eigenschaft liefert (auf SQLite fällt das nicht auf).
		await sequelize.authenticate();

		if (sequelize.getDialect() === 'mariadb') {
			// Im SQLite-Zweig (Dev/Tests) baut sync() das Schema aus den Modellen auf;
			// dort gibt es kein SequelizeMeta und alle Migrationen gälten fälschlich als
			// pending – die Abfrage bleibt deshalb auf MariaDB beschränkt.
			const pending = await createMigrator(sequelize).pending();
			body.pendingMigrations = pending.length;

			if (pending.length > 0) {
				// Der Prozess läuft, aber das Schema passt nicht zum Code: startDB() führt
				// Migrationen beim Start aus, offene Migrationen bedeuten also, dass etwas
				// schiefgelaufen ist.
				console.error(
					'Health-Check: ausstehende Migrationen:',
					pending.map((migration) => migration.name)
				);
				return json({ ...body, status: 'error' }, 503);
			}
		}

		return json(body, 200);
	} catch (e) {
		console.error('Health-Check fehlgeschlagen – Datenbank nicht erreichbar:', e);
		return json({ ...body, status: 'error' }, 503);
	}
}

/** Antwort ohne Caching – ein Health-Check darf niemals aus einem Proxy-Cache kommen. */
function json(body: HealthResponse, status: number): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'content-type': 'application/json',
			'cache-control': 'no-store'
		}
	});
}
