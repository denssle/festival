import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { QueryInterface, QueryTypes, Sequelize } from 'sequelize';
import { startDB } from '$lib/db/db';
import { sequelize } from '$lib/db/sequelize';
import { createMigrator } from '$lib/db/migrations';

/**
 * Drift-Schutz Modelle ↔ Migrationen (der Preis der Kernentscheidung, Dev/Test auf
 * sync() zu lassen und nur Prod über Migrationen zu fahren):
 *
 * Baut zwei frische In-Memory-SQLite-Schemata auf – eines per `sync()` aus den
 * Modellen (der Dev-/Test-Pfad), eines per `umzug.up()` aus den Migrationen (der
 * Prod-Pfad) – und vergleicht sie strukturell. Weicht eine Modelländerung ohne
 * zugehörige Migration ab (oder umgekehrt), schlägt dieser Test fehl.
 *
 * Grenze: Der Vergleich läuft dialektfrei auf SQLite. MariaDB-spezifisches
 * Verhalten deckt der Smoke-Test in der CI ab (`scripts/smoke-test.sh`, echte MariaDB).
 */
describe('Migrationen erzeugen dasselbe Schema wie die Modelle', () => {
	let migrated: Sequelize;

	beforeAll(async () => {
		await startDB(); // App-DB: sync() aus den Modellen
		migrated = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
		await createMigrator(migrated).up();
	});

	afterAll(async () => {
		await migrated.close();
	});

	interface IndexDescription {
		unique: boolean;
		fields: { attribute: string }[];
	}

	/** Relevante Spalteneigenschaften (dialektstabil vergleichbar). */
	interface ColumnShape {
		type: string;
		allowNull: boolean;
		primaryKey: boolean;
	}

	async function tableNames(qi: QueryInterface): Promise<string[]> {
		const tables = await qi.showAllTables();
		return tables
			.map(String)
			.filter((t) => t !== 'SequelizeMeta')
			.sort();
	}

	async function columnShapes(qi: QueryInterface, table: string): Promise<Record<string, ColumnShape>> {
		const described = await qi.describeTable(table);
		const shapes: Record<string, ColumnShape> = {};
		for (const [name, column] of Object.entries(described)) {
			shapes[name] = {
				type: column.type,
				allowNull: column.allowNull,
				primaryKey: column.primaryKey
			};
		}
		return shapes;
	}

	/** Dedupliziertes, sortiertes Set der Unique-Index-Spaltenkombinationen. */
	async function uniqueFieldSets(qi: QueryInterface, table: string): Promise<string[]> {
		const indexes = (await qi.showIndex(table)) as IndexDescription[];
		const sets = indexes.filter((i) => i.unique).map((i) => i.fields.map((f) => f.attribute).join(','));
		return [...new Set(sets)].sort();
	}

	interface ForeignKeyRow {
		from: string;
		table: string;
		to: string;
		on_delete: string;
		on_update: string;
	}

	/**
	 * Fremdschlüssel samt ON DELETE/ON UPDATE, sortiert. Liest SQLites PRAGMA direkt:
	 * Diese Details verschwinden bei einem Tabellen-Neuaufbau am leichtesten (so geschehen
	 * mit Sequelizes `changeColumn` beim Entwurf von Migration 0002), und ohne ON DELETE
	 * CASCADE bleiben beim Löschen Waisen zurück.
	 */
	async function foreignKeys(db: Sequelize, table: string): Promise<string[]> {
		const rows = await db.query<ForeignKeyRow>(`PRAGMA foreign_key_list(\`${table}\`)`, { type: QueryTypes.SELECT });
		return rows
			.map((fk) => `${fk.from} → ${fk.table}.${fk.to} ON DELETE ${fk.on_delete} ON UPDATE ${fk.on_update}`)
			.sort();
	}

	it('legt dieselben Tabellen an', async () => {
		expect(await tableNames(migrated.getQueryInterface())).toEqual(await tableNames(sequelize.getQueryInterface()));
	});

	it('legt pro Tabelle dieselben Spalten (Typ, allowNull, PK) an', async () => {
		for (const table of await tableNames(sequelize.getQueryInterface())) {
			const fromModels = await columnShapes(sequelize.getQueryInterface(), table);
			const fromMigrations = await columnShapes(migrated.getQueryInterface(), table);
			expect(fromMigrations, `Tabelle ${table}`).toEqual(fromModels);
		}
	});

	it('legt pro Tabelle dieselben Unique-Constraints an', async () => {
		for (const table of await tableNames(sequelize.getQueryInterface())) {
			const fromModels = await uniqueFieldSets(sequelize.getQueryInterface(), table);
			const fromMigrations = await uniqueFieldSets(migrated.getQueryInterface(), table);
			expect(fromMigrations, `Tabelle ${table}`).toEqual(fromModels);
		}
	});

	it('legt pro Tabelle dieselben Fremdschlüssel (inkl. ON DELETE) an', async () => {
		for (const table of await tableNames(sequelize.getQueryInterface())) {
			const fromModels = await foreignKeys(sequelize, table);
			const fromMigrations = await foreignKeys(migrated, table);
			expect(fromMigrations, `Tabelle ${table}`).toEqual(fromModels);
		}
	});
});
