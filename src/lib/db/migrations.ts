import { QueryInterface, Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';

/** Vertrag, den jede Datei in migrations/ erfüllen muss. */
interface MigrationModule {
	up(queryInterface: QueryInterface): Promise<void>;
	down(queryInterface: QueryInterface): Promise<void>;
}

// Migrationen als Modul-Array statt Dateisystem-Ordner: `vite build` bündelt den
// Server nach build/ – ein migrations/-Ordner läge dort nicht (und wird auch nicht
// gersynct). import.meta.glob sammelt die Dateien zur BUILD-Zeit ein, sie landen
// mit im Bundle; kein Extra-Deploy-Schritt, keine CLI auf dem Host.
const modules = import.meta.glob<MigrationModule>('./migrations/*.ts', { eager: true });

/**
 * Baut die umzug-Instanz für die gegebene Verbindung. Ausgeführte Migrationen
 * werden über SequelizeStorage in der Tabelle `SequelizeMeta` protokolliert;
 * `up()` führt nur Pending-Migrationen aus und ist damit bei jedem Start idempotent.
 *
 * Läuft beim Serverstart in `startDB()` – bei EINEM Node-Prozess (Uberspace)
 * unkritisch; bei mehreren Instanzen bräuchte es ein Advisory Lock.
 */
export function createMigrator(sequelize: Sequelize): Umzug<QueryInterface> {
	const migrations = Object.entries(modules)
		.map(([path, module]) => ({
			// './migrations/0001-initial-schema.ts' → '0001-initial-schema'
			name: path.split('/').pop()!.replace(/\.ts$/, ''),
			up: ({ context }: { context: QueryInterface }) => module.up(context),
			down: ({ context }: { context: QueryInterface }) => module.down(context)
		}))
		// Dateiname = Ausführungsreihenfolge (0001-, 0002-, …)
		.sort((a, b) => a.name.localeCompare(b.name));

	return new Umzug({
		migrations,
		context: sequelize.getQueryInterface(),
		storage: new SequelizeStorage({ sequelize }),
		logger: console
	});
}

/** Name der Baseline-Migration – das komplette Schema zum Stand v0.7.23. */
export const BASELINE_MIGRATION = '0001-initial-schema';

/**
 * Trägt die Baseline als ausgeführt ein, OHNE sie auszuführen – für Datenbanken, die
 * noch aus der `sync({ alter: true })`-Zeit stammen und deren Schema deshalb bereits
 * steht, aber kein `SequelizeMeta` besitzen.
 *
 * Ohne diesen Stempel hält umzug die Baseline für ausstehend und legt das Schema ein
 * zweites Mal an. Die `CREATE TABLE IF NOT EXISTS` laufen dabei folgenlos durch, aber
 * `ADD UNIQUE INDEX` kennt kein IF NOT EXISTS und bricht mit "Duplicate key name"
 * (Fehler 1061) ab – genau so blieb die Produktion nach v0.7.24 unten.
 *
 * Greift bewusst eng: nur wenn NOCH KEINE Migration protokolliert ist (frisch
 * angelegtes, leeres SequelizeMeta) UND die Tabelle `users` bereits existiert. Eine
 * leere Datenbank läuft damit weiter regulär durch alle Migrationen.
 *
 * @returns true, wenn gestempelt wurde
 */
export async function stampBaselineIfLegacySchema(
	sequelize: Sequelize,
	migrator: Umzug<QueryInterface>
): Promise<boolean> {
	// Legt SequelizeMeta an, falls noch nicht vorhanden, und liefert das Protokoll.
	const executed = await migrator.executed();
	if (executed.length > 0) {
		return false;
	}

	const tables = await sequelize.getQueryInterface().showAllTables();
	const hasLegacySchema = tables.some((table) => table.toLowerCase() === 'users');
	if (!hasLegacySchema) {
		return false;
	}

	await sequelize.getQueryInterface().bulkInsert('SequelizeMeta', [{ name: BASELINE_MIGRATION }]);
	console.info(
		`Bestehendes Schema ohne Migrationsprotokoll erkannt: '${BASELINE_MIGRATION}' als ausgeführt eingetragen (nicht ausgeführt).`
	);
	return true;
}
