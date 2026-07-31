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
