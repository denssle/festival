import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';

/**
 * Grundlage für Mails an Nutzer (Passwort-Reset, entschieden 2026-09-30):
 *
 * - `users.emailVerifiedAt`: wann die hinterlegte Adresse bestätigt wurde. Reset-Links
 *   gehen nur an bestätigte Adressen – eine vertippte oder fremde Adresse bekäme sonst
 *   den Zugang zum Konto.
 * - Tabelle `mailTokens`: einmalige Links aus Mails, nur als Hash gespeichert, per FK an
 *   den Nutzer gebunden (ON DELETE CASCADE – die Kontolöschung räumt sie mit ab).
 *
 * Wie: `addColumn` für eine nullable Spalte ohne Index ist in beiden Dialekten ein
 * schlichtes ALTER TABLE … ADD (anders als changeColumn/removeColumn, siehe 0002).
 * `createTable` legt FK und Unique-Index in MariaDB wie SQLite korrekt an.
 *
 * Wiederholbar (DDL ist in MariaDB nicht transaktional): Jeder Schritt prüft, ob er schon
 * erledigt ist.
 */

const TABLE = 'mailTokens';

export async function up(queryInterface: QueryInterface): Promise<void> {
	const userColumns = await queryInterface.describeTable('users');
	if (!('emailVerifiedAt' in userColumns)) {
		await queryInterface.addColumn('users', 'emailVerifiedAt', { type: DataTypes.DATE, allowNull: true });
	}

	if (!(await tableExists(queryInterface, TABLE))) {
		await queryInterface.createTable(
			TABLE,
			{
				id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
				UserId: {
					type: DataTypes.STRING,
					allowNull: false,
					references: { model: 'users', key: 'id' },
					onDelete: 'CASCADE',
					onUpdate: 'CASCADE'
				},
				purpose: { type: DataTypes.STRING, allowNull: false },
				tokenHash: { type: DataTypes.STRING, allowNull: false, unique: true },
				email: { type: DataTypes.STRING, allowNull: true },
				expiresAt: { type: DataTypes.DATE, allowNull: false },
				createdAt: { type: DataTypes.DATE, allowNull: false },
				updatedAt: { type: DataTypes.DATE, allowNull: false }
			},
			await collationOf(queryInterface, 'users')
		);
	}
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.dropTable(TABLE);
	const userColumns = await queryInterface.describeTable('users');
	if ('emailVerifiedAt' in userColumns) {
		// Rohes DROP COLUMN statt removeColumn – siehe 0004.
		await queryInterface.sequelize.query('ALTER TABLE `users` DROP COLUMN `emailVerifiedAt`');
	}
}

async function tableExists(queryInterface: QueryInterface, table: string): Promise<boolean> {
	const tables = (await queryInterface.showAllTables()) as unknown[];
	return tables.some(
		(entry) => (typeof entry === 'string' ? entry : (entry as { tableName: string }).tableName) === table
	);
}

/**
 * Sortierung der Tabelle, auf die der FK zeigt. In MariaDB muss die FK-Spalte exakt dieselbe
 * haben (sonst errno 150); ohne Angabe gälte der Server-Standard, und der weicht auf
 * MariaDB 11 von den Bestandstabellen ab. Ausführlich in Migration 0003.
 */
async function collationOf(
	queryInterface: QueryInterface,
	table: string
): Promise<{ charset?: string; collate?: string }> {
	const sequelize = queryInterface.sequelize;
	if (sequelize.getDialect() === 'sqlite') {
		return {};
	}
	const [row] = await sequelize.query<{ collation: string }>(
		'SELECT TABLE_COLLATION AS collation FROM information_schema.TABLES ' +
			'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
		{ replacements: [table], type: QueryTypes.SELECT }
	);
	return { charset: row.collation.split('_')[0], collate: row.collation };
}
