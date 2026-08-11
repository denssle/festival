import { afterEach, describe, expect, it } from 'vitest';
import { Sequelize } from 'sequelize';
import { BASELINE_MIGRATION, createMigrator, stampBaselineIfLegacySchema } from '$lib/db/migrations';

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
	let db: Sequelize;

	afterEach(async () => {
		await db.close();
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

	it('rührt eine bereits migrierte DB nicht an', async () => {
		const migrated = freshDb();
		const migrator = createMigrator(migrated);
		await migrator.up();
		const before = (await migrator.executed()).map((migration) => migration.name);

		expect(await stampBaselineIfLegacySchema(migrated, migrator)).toBe(false);

		expect((await migrator.executed()).map((migration) => migration.name)).toEqual(before);
	});
});
