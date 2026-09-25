import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';

/**
 * `guestInformations.coming` (BOOLEAN) wird zu `answer` mit den Werten 'yes' | 'maybe' |
 * 'no' (Typ `Answer` in src/lib/models/Answer.ts) – für die Antwort „Vielleicht“.
 *
 * Übernahme: true → 'yes', alles andere → 'no'. Ein NULL galt im Code schon immer als
 * „nicht dabei“ (Filter auf `!coming`).
 *
 * Wie: ADD COLUMN, UPDATE, DROP COLUMN – alles als einfaches ALTER TABLE, das SQLite und
 * MariaDB nativ können. Bewusst NICHT Sequelizes `removeColumn`: Das baut die Tabelle
 * unter SQLite neu auf und verliert dabei den zusammengesetzten Unique-Index
 * (FestivalEventId, UserId) und das ON DELETE CASCADE (siehe Migration 0002).
 *
 * Wiederholbar wie 0003 (DDL ist in MariaDB nicht transaktional): Jeder Schritt prüft,
 * ob er schon erledigt ist.
 */

const TABLE = 'guestInformations';
const CHECK_NAME = 'guest_informations_answer_gueltig';

export async function up(queryInterface: QueryInterface): Promise<void> {
	const sequelize = queryInterface.sequelize;
	const columns = await queryInterface.describeTable(TABLE);

	if (!('answer' in columns)) {
		// NOT NULL braucht beim Anhängen einen Default (SQLite verlangt ihn, MariaDB füllt damit).
		await queryInterface.addColumn(TABLE, 'answer', {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'no'
		});
	}
	if ('coming' in columns) {
		await sequelize.query(`UPDATE \`${TABLE}\` SET answer = CASE WHEN coming = 1 THEN 'yes' ELSE 'no' END`);
		await sequelize.query(`ALTER TABLE \`${TABLE}\` DROP COLUMN \`coming\``);
	}

	// SQLite kann keinen CHECK nachträglich anhängen; dort greift der Modell-Validator (isIn).
	if (sequelize.getDialect() !== 'sqlite' && !(await checkExists(queryInterface))) {
		await sequelize.query(
			`ALTER TABLE \`${TABLE}\` ADD CONSTRAINT \`${CHECK_NAME}\` CHECK (answer IN ('yes', 'maybe', 'no'))`
		);
	}
}

/**
 * Verlustbehaftet: 'maybe' gibt es in einem Boolean nicht und wird zu false (nicht dabei).
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
	const sequelize = queryInterface.sequelize;
	const columns = await queryInterface.describeTable(TABLE);

	if (sequelize.getDialect() !== 'sqlite' && (await checkExists(queryInterface))) {
		await sequelize.query(`ALTER TABLE \`${TABLE}\` DROP CONSTRAINT \`${CHECK_NAME}\``);
	}
	if (!('coming' in columns)) {
		await queryInterface.addColumn(TABLE, 'coming', { type: DataTypes.BOOLEAN });
	}
	if ('answer' in columns) {
		await sequelize.query(`UPDATE \`${TABLE}\` SET coming = CASE WHEN answer = 'yes' THEN 1 ELSE 0 END`);
		await sequelize.query(`ALTER TABLE \`${TABLE}\` DROP COLUMN \`answer\``);
	}
}

async function checkExists(queryInterface: QueryInterface): Promise<boolean> {
	const [row] = await queryInterface.sequelize.query<{ n: number }>(
		'SELECT COUNT(*) AS n FROM information_schema.CHECK_CONSTRAINTS ' +
			'WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = ?',
		{ replacements: [CHECK_NAME], type: QueryTypes.SELECT }
	);
	return Number(row.n) > 0;
}
