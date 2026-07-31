import { DataTypes, QueryInterface } from 'sequelize';

/**
 * Baseline-Migration: das komplette Schema zum Stand v0.7.23
 * (10 Tabellen, FKs mit ON DELETE CASCADE, Unique-Indizes).
 *
 * EINGEFROREN – diese Datei wird nie wieder angefasst. Sie ist bewusst NICHT aus den
 * Modellen abgeleitet (kein `sync()`-Aufruf), sonst würde sie mit jeder Modelländerung
 * mitdriften und spätere Migrationen (0002+) würden auf frischen DBs doppelt anlegen,
 * was bereits die Baseline enthält. Jede künftige Schemaänderung bekommt eine eigene,
 * neue Migrationsdatei (siehe Quadrat-Regel in CLAUDE.md).
 *
 * Die Übereinstimmung mit den Modellen sichert `migrations.spec.ts` ab (Drift-Test).
 */

/** Von Sequelize bei `timestamps: true` verwaltete Spalten – Teil jeder Tabelle. */
const timestamps = {
	createdAt: { type: DataTypes.DATE, allowNull: false },
	updatedAt: { type: DataTypes.DATE, allowNull: false }
};

/** FK-Spalte mit ON DELETE CASCADE (Muster für alle Beziehungen, siehe db.ts). */
function cascadeFk(table: string) {
	return {
		type: DataTypes.STRING,
		allowNull: false,
		references: { model: table, key: 'id' },
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE'
	};
}

export async function up(queryInterface: QueryInterface): Promise<void> {
	// Reihenfolge: erst referenzierte Tabellen (users, festivalEvents, groups), dann abhängige
	await queryInterface.createTable('users', {
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		password: { type: DataTypes.STRING, allowNull: false },
		nickname: { type: DataTypes.STRING, allowNull: false, unique: true },
		forename: { type: DataTypes.STRING },
		lastname: { type: DataTypes.STRING },
		email: { type: DataTypes.STRING },
		...timestamps
	});

	await queryInterface.createTable('userImages', {
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		UserId: cascadeFk('users'),
		image: { type: DataTypes.BLOB('long'), allowNull: false },
		...timestamps
	});

	await queryInterface.createTable('sessionTokens', {
		UserId: { ...cascadeFk('users'), primaryKey: true },
		token: { type: DataTypes.STRING, allowNull: false },
		...timestamps
	});

	await queryInterface.createTable('festivalEvents', {
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.STRING },
		location: { type: DataTypes.STRING },
		bringYourOwnBottle: { type: DataTypes.BOOLEAN },
		bringYourOwnFood: { type: DataTypes.BOOLEAN },
		startDate: { type: DataTypes.DATE },
		UserId: cascadeFk('users'),
		...timestamps
	});

	await queryInterface.createTable('groups', {
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.STRING },
		ownerId: cascadeFk('users'),
		...timestamps
	});

	await queryInterface.createTable('guestInformations', {
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		food: { type: DataTypes.STRING },
		drink: { type: DataTypes.STRING },
		numberOfOtherGuests: { type: DataTypes.INTEGER },
		coming: { type: DataTypes.BOOLEAN },
		comment: { type: DataTypes.STRING },
		FestivalEventId: cascadeFk('festivalEvents'),
		UserId: cascadeFk('users'),
		...timestamps
	});
	await queryInterface.addIndex('guestInformations', ['FestivalEventId', 'UserId'], { unique: true });

	await queryInterface.createTable('groupMembers', {
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		GroupId: cascadeFk('groups'),
		UserId: cascadeFk('users'),
		...timestamps
	});
	await queryInterface.addIndex('groupMembers', ['GroupId', 'UserId'], { unique: true });

	await queryInterface.createTable('friendRequests', {
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		senderId: cascadeFk('users'),
		receiverId: cascadeFk('users'),
		...timestamps
	});
	await queryInterface.addIndex('friendRequests', ['senderId', 'receiverId'], { unique: true });

	await queryInterface.createTable('friendships', {
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		friend1Id: cascadeFk('users'),
		friend2Id: cascadeFk('users'),
		...timestamps
	});
	await queryInterface.addIndex('friendships', ['friend1Id', 'friend2Id'], { unique: true });

	await queryInterface.createTable('comments', {
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		writtenBy: cascadeFk('users'),
		// writtenTo ist polymorph (Festival- ODER User-ID) – bewusst KEIN FK,
		// Aufräumen übernimmt CommentService.deleteCommentsWrittenTo (siehe db.ts/CLAUDE.md)
		writtenTo: { type: DataTypes.STRING, allowNull: false },
		comment: { type: DataTypes.STRING },
		...timestamps
	});
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	// Umgekehrte Reihenfolge wegen FK-Abhängigkeiten
	await queryInterface.dropTable('comments');
	await queryInterface.dropTable('friendships');
	await queryInterface.dropTable('friendRequests');
	await queryInterface.dropTable('groupMembers');
	await queryInterface.dropTable('guestInformations');
	await queryInterface.dropTable('groups');
	await queryInterface.dropTable('festivalEvents');
	await queryInterface.dropTable('sessionTokens');
	await queryInterface.dropTable('userImages');
	await queryInterface.dropTable('users');
}
