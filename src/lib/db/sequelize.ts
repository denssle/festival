import { type Options, Sequelize } from 'sequelize';
import { env } from '$env/dynamic/private';
const { MARIA_DB_NAME, MARIA_DB_PASSWORD, MARIA_DB_USER } = env;

const isTestOrLocal =
	MARIA_DB_NAME == 'dev' ||
	process.env.NODE_ENV === 'test' ||
	process.env.VITEST === 'true' ||
	process.env.PLAYWRIGHT === 'true';

/**
 * Prüft die Zugangsdaten, bevor eine Verbindung aufgebaut wird.
 *
 * Ohne sie verbindet sich der mariadb-Treiber als Benutzer '' ohne Passwort und
 * bricht mit einem nichtssagenden "Access denied for ''@..." (Fehler 1045) ab.
 * Häufigste Ursache: `node build` lädt – anders als `vite dev` – keine .env; das
 * Startskript muss sie per --env-file mitgeben (siehe package.json).
 *
 * Bewusst eine Funktion und KEIN Check auf Modulebene: `vite build` importiert die
 * Servermodule in seiner Analyse-Phase, ein Fehler beim Import würde also schon den
 * Build abbrechen – auch in der CI, die diese Variablen gar nicht kennt (v0.7.26).
 * Aufgerufen wird sie in startDB(), wo die Verbindung tatsächlich zustande kommt.
 */
export function assertDatabaseCredentials(): void {
	if (!isTestOrLocal && !(MARIA_DB_USER && MARIA_DB_PASSWORD)) {
		throw new Error(
			'DB-Zugangsdaten fehlen: MARIA_DB_USER und/oder MARIA_DB_PASSWORD sind nicht gesetzt. ' +
				'Liegt eine .env im Arbeitsverzeichnis und wird sie geladen (npm run start-server nutzt --env-file=.env)?'
		);
	}
}

const options: Options = isTestOrLocal
	? {
			dialect: 'sqlite',
			storage: ':memory:',
			logging: false
		}
	: {
			dialect: 'mariadb',
			host: 'localhost',
			username: MARIA_DB_USER,
			password: MARIA_DB_PASSWORD,
			database: MARIA_DB_USER + '_' + MARIA_DB_NAME,
			define: {}
		};

export const sequelize: Sequelize = new Sequelize(options);
