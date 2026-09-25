import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';

/**
 * Die polymorphe Spalte `comments.writtenTo` (Festival- ODER User-ID) wird durch zwei
 * nullbare Fremdschlüssel ersetzt: `FestivalEventId` und `ProfileUserId`, genau einer
 * gesetzt.
 *
 * Warum: Auf eine polymorphe Spalte passt kein FK. Die DB räumte beim Löschen eines Ziels
 * deshalb nichts ab – das erledigte Service-Code an zwei Stellen (Festival löschen,
 * Konto löschen), und Kommentare an nicht existierende IDs ließen sich anlegen. Mit den
 * FKs übernimmt die Kaskade beides, der Aufräumcode entfällt.
 *
 * Wie: Tabelle neu aufbauen statt Spalten anzuhängen – in BEIDEN Dialekten derselbe Weg.
 * `createTable` legt FKs samt ON DELETE CASCADE in MariaDB wie SQLite korrekt an (die
 * Baseline nutzt ihn genauso), während `changeColumn`/`addColumn` unter SQLite Schema-
 * Details verlieren (siehe Migration 0002). Unkritisch, weil keine andere Tabelle auf
 * `comments` verweist: DROP TABLE löst keine Kaskade aus.
 *
 * Kosmetisch: In MariaDB behalten die FKs die automatisch vergebenen Namen der
 * Zwischentabelle (`comments_0003_neu_ibfk_*`). Umgekehrt (alte Tabelle umbenennen, neue
 * gleich unter `comments` anlegen) ginge es nicht – Constraint-Namen gelten dort
 * datenbankweit, `comments_ibfk_1` wäre doppelt vergeben.
 */

const NEW_TABLE = 'comments_0003_neu';
const OLD_TABLE = 'comments_0003_alt';

const timestamps = {
	createdAt: { type: DataTypes.DATE, allowNull: false },
	updatedAt: { type: DataTypes.DATE, allowNull: false }
};

function cascadeFk(table: string, allowNull: boolean) {
	return {
		type: DataTypes.STRING,
		allowNull,
		references: { model: table, key: 'id' },
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE'
	};
}

/**
 * FK für die beiden Zielspalten: ON UPDATE NO ACTION statt CASCADE. MariaDB verbietet
 * CHECK-Constraints auf Spalten, die ein FK per Kaskade ÄNDERN kann (Fehler 1901,
 * "Function or expression … cannot be used in the CHECK clause"), weil die Kaskade den
 * CHECK umginge. ON DELETE CASCADE ist erlaubt – die Zeile verschwindet ja ganz.
 * Unbedenklich: Die IDs sind UUIDs und werden nie geändert. Nachgestellt auf MariaDB
 * 10.11 (wie auf dem Uberspace), gefunden vom Smoke-Test.
 */
function targetFk(table: string) {
	return { ...cascadeFk(table, true), onUpdate: 'NO ACTION' };
}

/**
 * Wiederholbar gebaut: DDL ist in MariaDB nicht transaktional. Scheitert ein Lauf nach dem
 * Umbenennen (etwa am CHECK), steht die neue Tabelle schon, die Migration aber nicht im
 * Protokoll – und ein zweiter Lauf, der blind `writtenTo` liest, käme nie wieder durch.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
	const sequelize = queryInterface.sequelize;
	const columns = await queryInterface.describeTable('comments');
	if ('writtenTo' in columns) {
		await rebuildWithTargetColumns(queryInterface);
	}
	if (sequelize.getDialect() !== 'sqlite') {
		await addExactlyOneTargetCheck(queryInterface);
	}
}

async function rebuildWithTargetColumns(queryInterface: QueryInterface): Promise<void> {
	const sequelize = queryInterface.sequelize;
	// Reste eines abgebrochenen Laufs wegräumen.
	await queryInterface.dropTable(NEW_TABLE);

	await queryInterface.createTable(
		NEW_TABLE,
		{
			id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
			writtenBy: cascadeFk('users', false),
			FestivalEventId: targetFk('festivalEvents'),
			ProfileUserId: targetFk('users'),
			comment: { type: DataTypes.TEXT },
			...timestamps
		},
		await collationOfExistingTable(queryInterface)
	);

	// Ziel-ID der richtigen Tabelle zuordnen. Kommentare, deren Ziel es nicht mehr gibt,
	// sind Waisen aus der Zeit ohne FK – sie hatten nie eine sichtbare Seite und fallen weg.
	await sequelize.query(`
		INSERT INTO \`${NEW_TABLE}\` (id, writtenBy, FestivalEventId, ProfileUserId, comment, createdAt, updatedAt)
		SELECT c.id, c.writtenBy,
			CASE WHEN f.id IS NOT NULL THEN c.writtenTo END,
			CASE WHEN f.id IS NULL AND u.id IS NOT NULL THEN c.writtenTo END,
			c.comment, c.createdAt, c.updatedAt
		FROM \`comments\` c
		LEFT JOIN \`festivalEvents\` f ON f.id = c.writtenTo
		LEFT JOIN \`users\` u ON u.id = c.writtenTo
		WHERE f.id IS NOT NULL OR u.id IS NOT NULL
	`);

	const [before] = await sequelize.query<{ n: number }>('SELECT COUNT(*) AS n FROM `comments`', {
		type: QueryTypes.SELECT
	});
	const [after] = await sequelize.query<{ n: number }>(`SELECT COUNT(*) AS n FROM \`${NEW_TABLE}\``, {
		type: QueryTypes.SELECT
	});
	const orphans = Number(before.n) - Number(after.n);
	if (orphans > 0) {
		console.info(`Migration 0003: ${orphans} Kommentar(e) ohne existierendes Ziel verworfen.`);
	}

	await queryInterface.dropTable('comments');
	await queryInterface.renameTable(NEW_TABLE, 'comments');
}

/**
 * Zeichensatz und Sortierung der bestehenden `comments`-Tabelle. In MariaDB müssen
 * FK-Spalten exakt dieselbe Sortierung haben wie die Spalte, auf die sie zeigen – sonst
 * "Foreign key constraint is incorrectly formed" (errno 150). Ohne Angabe bekäme die neue
 * Tabelle den Standard des Servers; der stimmt auf dem Uberspace zufällig mit den
 * Bestandstabellen überein (utf8mb4_unicode_ci), auf MariaDB 11 aber nicht mehr
 * (utf8mb4_uca1400_ai_ci). Gefunden vom Smoke-Test mit dem Baseline-Schema aus Prod.
 */
async function collationOfExistingTable(
	queryInterface: QueryInterface
): Promise<{ charset?: string; collate?: string }> {
	const sequelize = queryInterface.sequelize;
	if (sequelize.getDialect() === 'sqlite') {
		return {};
	}
	const [row] = await sequelize.query<{ collation: string }>(
		'SELECT TABLE_COLLATION AS collation FROM information_schema.TABLES ' +
			"WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comments'",
		{ type: QueryTypes.SELECT }
	);
	return { charset: row.collation.split('_')[0], collate: row.collation };
}

/**
 * Genau ein Ziel. SQLite kann einen CHECK nicht nachträglich anhängen; dort (und für den
 * sync()-Pfad in Dev/Tests) greift der Modell-Validator `exactlyOneTarget`.
 */
async function addExactlyOneTargetCheck(queryInterface: QueryInterface): Promise<void> {
	const sequelize = queryInterface.sequelize;
	const [existing] = await sequelize.query<{ n: number }>(
		'SELECT COUNT(*) AS n FROM information_schema.CHECK_CONSTRAINTS ' +
			"WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'comments_genau_ein_ziel'",
		{ type: QueryTypes.SELECT }
	);
	if (Number(existing.n) === 0) {
		await sequelize.query(
			'ALTER TABLE `comments` ADD CONSTRAINT `comments_genau_ein_ziel` ' +
				'CHECK ((`FestivalEventId` IS NULL) <> (`ProfileUserId` IS NULL))'
		);
	}
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	const sequelize = queryInterface.sequelize;
	await queryInterface.dropTable(OLD_TABLE);

	await queryInterface.createTable(OLD_TABLE, {
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		writtenBy: cascadeFk('users', false),
		writtenTo: { type: DataTypes.STRING, allowNull: false },
		comment: { type: DataTypes.TEXT },
		...timestamps
	});
	await sequelize.query(`
		INSERT INTO \`${OLD_TABLE}\` (id, writtenBy, writtenTo, comment, createdAt, updatedAt)
		SELECT id, writtenBy, COALESCE(FestivalEventId, ProfileUserId), comment, createdAt, updatedAt
		FROM \`comments\`
	`);
	await queryInterface.dropTable('comments');
	await queryInterface.renameTable(OLD_TABLE, 'comments');
}
