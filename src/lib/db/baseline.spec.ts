import { afterEach, describe, expect, it } from 'vitest';
import { Sequelize } from 'sequelize';
import {
	BASELINE_MIGRATION,
	createMigrator,
	normalizeTableNames,
	stampBaselineIfLegacySchema
} from '$lib/db/migrations';

/**
 * Absicherung des Baseline-Stempels. Die Funktion überspringt bewusst eine Migration –
 * greift sie zu breit, bleibt echtes Schema ungebaut und der Fehler fällt erst später
 * im Betrieb auf. Die drei Fälle unten grenzen genau das ab.
 *
 * Hintergrund: Die Produktions-DB stammt aus der `sync({ alter: true })`-Zeit und hat
 * kein SequelizeMeta. umzug hielt die Baseline deshalb für ausstehend und lief beim
 * `ADD UNIQUE INDEX` in "Duplicate key name" (Fehler 1061) – der Serverstart brach ab.
 */
describe('Baseline-Stempel für Datenbanken aus der sync()-Zeit', () => {
	// Nur die Tests, die eine DB anlegen, haben eine zu schließen – der reine
	// Funktionstest unten kommt ohne aus.
	let db: Sequelize | undefined;

	afterEach(async () => {
		if (db) {
			await db.close();
			db = undefined;
		}
	});

	function freshDb(): Sequelize {
		db = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
		return db;
	}

	it('stempelt eine Bestands-DB (Schema vorhanden, kein Migrationsprotokoll)', async () => {
		const legacy = freshDb();
		// Simuliert den Zustand nach sync(): Tabellen da, SequelizeMeta nicht.
		await legacy.getQueryInterface().createTable('users', { id: { type: 'VARCHAR(255)', primaryKey: true } });
		const migrator = createMigrator(legacy);

		expect(await stampBaselineIfLegacySchema(legacy, migrator)).toBe(true);

		const executed = (await migrator.executed()).map((migration) => migration.name);
		expect(executed).toContain(BASELINE_MIGRATION);
	});

	it('lässt eine leere DB regulär durch alle Migrationen laufen', async () => {
		const empty = freshDb();
		const migrator = createMigrator(empty);

		expect(await stampBaselineIfLegacySchema(empty, migrator)).toBe(false);

		// Ohne Stempel muss die Baseline tatsächlich ausgeführt werden und Tabellen anlegen.
		await migrator.up();
		const tables = await empty.getQueryInterface().showAllTables();
		expect(tables.map(String)).toContain('users');
	});

	// Der Objekt-Fall lässt sich auf SQLite nicht erzeugen, ist aber genau der, an dem
	// der Stempel in Produktion scheiterte – deshalb hier direkt gegen die reine Funktion.
	it('versteht beide Rückgabeformen von showAllTables (SQLite: String, MariaDB: Objekt)', () => {
		expect(normalizeTableNames(['users', 'comments'])).toEqual(['users', 'comments']);
		expect(
			normalizeTableNames([
				{ tableName: 'users', schema: 'festival_prod' },
				{ tableName: 'comments', schema: 'festival_prod' }
			])
		).toEqual(['users', 'comments']);
	});

	it('rührt eine bereits migrierte DB nicht an', async () => {
		const migrated = freshDb();
		const migrator = createMigrator(migrated);
		await migrator.up();
		const before = (await migrator.executed()).map((migration) => migration.name);

		expect(await stampBaselineIfLegacySchema(migrated, migrator)).toBe(false);

		expect((await migrator.executed()).map((migration) => migration.name)).toEqual(before);
	});
});
