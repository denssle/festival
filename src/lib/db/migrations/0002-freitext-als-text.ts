import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';

/**
 * Freitextfelder von VARCHAR(255) auf TEXT umstellen.
 *
 * Kommentare und Beschreibungen sind echter Freitext, 255 Zeichen reichen dafür nicht.
 * In MariaDB scheiterte ein längerer Text mit "Data too long" (→ 500), SQLite in
 * Dev/Tests ließ ihn durch. Die zugehörige Längenprüfung vor der DB steht in
 * `text-length.logic.ts` (MAX_LONG_TEXT_LENGTH).
 *
 * Kurzfelder (Namen, Ort, Essen/Getränk, Profildaten) bleiben VARCHAR(255) und werden
 * dort gegen MAX_SHORT_TEXT_LENGTH geprüft.
 */
const FREE_TEXT_COLUMNS: [table: string, column: string][] = [
	['comments', 'comment'],
	['festivalEvents', 'description'],
	['groups', 'description'],
	['guestInformations', 'comment']
];

export async function up(queryInterface: QueryInterface): Promise<void> {
	for (const [table, column] of FREE_TEXT_COLUMNS) {
		await changeColumnType(queryInterface, table, column, 'VARCHAR(255)', 'TEXT');
	}
}

/**
 * Achtung: Texte mit mehr als 255 Zeichen passen danach nicht mehr in die Spalte.
 * MariaDB bricht das Zurückstellen in dem Fall im Strict-Mode mit "Data too long" ab –
 * ein Rollback ist also nur verlustfrei möglich, solange noch niemand lange Texte
 * geschrieben hat.
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
	for (const [table, column] of FREE_TEXT_COLUMNS) {
		await changeColumnType(queryInterface, table, column, 'TEXT', 'VARCHAR(255)');
	}
}

async function changeColumnType(
	queryInterface: QueryInterface,
	table: string,
	column: string,
	from: 'VARCHAR(255)' | 'TEXT',
	to: 'VARCHAR(255)' | 'TEXT'
): Promise<void> {
	if (queryInterface.sequelize.getDialect() === 'sqlite') {
		await rebuildSqliteTableWithColumnType(queryInterface, table, column, from, to);
	} else {
		// MariaDB: ALTER TABLE … CHANGE – ändert nur diese Spalte, Indizes und FKs bleiben.
		await queryInterface.changeColumn(table, column, {
			type: to === 'TEXT' ? DataTypes.TEXT : DataTypes.STRING
		});
	}
}

/**
 * SQLite kennt kein ALTER COLUMN; Sequelize baut die Tabelle bei `changeColumn` deshalb
 * aus `describeTable()` neu auf – und verliert dabei Schema-Details: Aus dem
 * zusammengesetzten Unique-Index (FestivalEventId, UserId) werden zwei einzelne
 * UNIQUE-Spalten (ein Gast könnte nur noch einem Festival zusagen), und alle FKs
 * verlieren ihr ON DELETE CASCADE.
 *
 * Stattdessen das von SQLite dokumentierte Verfahren (https://sqlite.org/lang_altertable.html,
 * Abschnitt 7): Tabelle mit dem ORIGINALEN CREATE-Statement neu anlegen, in dem nur der
 * Spaltentyp ersetzt ist, Daten kopieren, alte Tabelle löschen, neue umbenennen und die
 * Indizes wiederherstellen. Betrifft nur Dev/Tests (Drift-Test), Prod läuft auf MariaDB.
 */
async function rebuildSqliteTableWithColumnType(
	queryInterface: QueryInterface,
	table: string,
	column: string,
	from: string,
	to: string
): Promise<void> {
	const sequelize = queryInterface.sequelize;
	const [definition] = await sequelize.query<{ sql: string }>(
		"SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?",
		{ replacements: [table], type: QueryTypes.SELECT }
	);
	const indexes = await sequelize.query<{ sql: string }>(
		"SELECT sql FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL",
		{ replacements: [table], type: QueryTypes.SELECT }
	);

	const columnDefinition = `\`${column}\` ${from}`;
	if (!definition?.sql.includes(columnDefinition)) {
		throw new Error(`Spalte ${table}.${column} hat nicht den erwarteten Typ ${from}`);
	}
	const tempTable = `${table}_0002_neu`;
	const createTemp = definition.sql
		.replace(`CREATE TABLE \`${table}\``, `CREATE TABLE \`${tempTable}\``)
		.replace(columnDefinition, `\`${column}\` ${to}`);

	// FK-Prüfung aus, sonst löst DROP TABLE die Kaskade auf abhängige Tabellen aus.
	// Das PRAGMA wirkt nur außerhalb einer Transaktion – umzug öffnet hier keine.
	await sequelize.query('PRAGMA foreign_keys = OFF');
	try {
		await sequelize.query(createTemp);
		await sequelize.query(`INSERT INTO \`${tempTable}\` SELECT * FROM \`${table}\``);
		await sequelize.query(`DROP TABLE \`${table}\``);
		await sequelize.query(`ALTER TABLE \`${tempTable}\` RENAME TO \`${table}\``);
		for (const index of indexes) {
			await sequelize.query(index.sql);
		}
	} finally {
		await sequelize.query('PRAGMA foreign_keys = ON');
	}
}
