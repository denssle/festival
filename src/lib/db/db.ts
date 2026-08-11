import { User } from '$lib/db/model/user';
import { UserImage } from '$lib/db/model/userImage';
import { GuestInformation } from '$lib/db/model/guestInformation';
import { SessionToken } from '$lib/db/model/sessionToken';
import { Group } from '$lib/db/model/group';
import { FestivalEvent } from '$lib/db/model/festivalEvent';
import { assertDatabaseCredentials, sequelize } from '$lib/db/sequelize';
import { createMigrator, stampBaselineIfLegacySchema } from '$lib/db/migrations';
import { FriendRequest } from '$lib/db/model/friendRequest';
import { GroupMember } from '$lib/db/model/groupMember';
import { Friendship } from '$lib/db/model/friendship';
import { Comment } from '$lib/db/model/comment';

FestivalEvent.hasMany(GuestInformation, { as: 'EventGuests', foreignKey: 'FestivalEventId', onDelete: 'CASCADE' });
GuestInformation.belongsTo(FestivalEvent, { foreignKey: 'FestivalEventId', as: 'FestivalEvent' });

User.hasMany(GuestInformation, { as: 'UserGuestInfos', foreignKey: 'UserId', onDelete: 'CASCADE' });
GuestInformation.belongsTo(User, { foreignKey: 'UserId', as: 'User' });

User.hasMany(FestivalEvent, { foreignKey: 'UserId', onDelete: 'CASCADE', as: 'Events' });
FestivalEvent.belongsTo(User, { foreignKey: 'UserId', as: 'User' });

User.hasOne(UserImage, { foreignKey: 'UserId', onDelete: 'CASCADE', as: 'Image' });
UserImage.belongsTo(User, { foreignKey: 'UserId', as: 'User' });

User.belongsToMany(User, {
	through: Friendship,
	as: 'friends',
	foreignKey: 'friend1Id',
	otherKey: 'friend2Id',
	onDelete: 'CASCADE'
});

User.hasMany(FriendRequest, {
	foreignKey: 'senderId',
	onDelete: 'CASCADE',
	as: 'SentFriendRequests'
});
FriendRequest.belongsTo(User, {
	as: 'sender',
	foreignKey: 'senderId'
});

User.hasMany(FriendRequest, {
	foreignKey: 'receiverId',
	onDelete: 'CASCADE',
	as: 'ReceivedFriendRequests'
});
FriendRequest.belongsTo(User, {
	as: 'receiver',
	foreignKey: 'receiverId'
});

// TODO multiple sessions?
User.hasOne(SessionToken, { foreignKey: 'UserId', onDelete: 'CASCADE', as: 'Session' });
SessionToken.belongsTo(User, { foreignKey: 'UserId', as: 'User' });

User.hasMany(Group, { as: 'ownedGroups', foreignKey: 'ownerId', onDelete: 'CASCADE' });
Group.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

Group.belongsToMany(User, {
	through: GroupMember,
	as: 'members',
	foreignKey: 'GroupId',
	otherKey: 'UserId',
	onDelete: 'CASCADE'
});
User.belongsToMany(Group, {
	through: GroupMember,
	as: 'joinedGroups',
	foreignKey: 'UserId',
	otherKey: 'GroupId',
	onDelete: 'CASCADE'
});

Group.hasMany(GroupMember, { foreignKey: 'GroupId', onDelete: 'CASCADE', as: 'GroupMembers' });
GroupMember.belongsTo(Group, { foreignKey: 'GroupId', as: 'Group' });

User.hasMany(GroupMember, { foreignKey: 'UserId', onDelete: 'CASCADE', as: 'GroupMemberships' });
GroupMember.belongsTo(User, { foreignKey: 'UserId', as: 'User' });

User.hasMany(Comment, { foreignKey: 'writtenBy', onDelete: 'CASCADE', as: 'Comments' });
Comment.belongsTo(User, { foreignKey: 'writtenBy', as: 'Author' });

let dbStarted = false;

export async function startDB(): Promise<void> {
	if (dbStarted) return;
	try {
		// Vor dem Verbindungsaufbau, damit fehlende Zugangsdaten als klare Meldung
		// auffallen statt als "Access denied for ''@…" aus dem Treiber.
		assertDatabaseCredentials();
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');

		if (sequelize.getDialect() === 'mariadb') {
			// Produktion: Schema kommt AUSSCHLIESSLICH aus Migrationen (umzug, Tabelle
			// SequelizeMeta). Führt nur Pending-Migrationen aus → idempotent bei jedem
			// Start. Modelländerungen brauchen eine neue Migrationsdatei (Quadrat-Regel
			// in CLAUDE.md) – bewusst kein sync()/alter gegen die echte DB.
			const migrator = createMigrator(sequelize);
			// Bestands-DB aus der sync()-Zeit einmalig auf die Baseline stempeln, sonst
			// legt umzug das bereits vorhandene Schema erneut an (siehe migrations.ts).
			await stampBaselineIfLegacySchema(sequelize, migrator);
			await migrator.up();
		} else {
			// Dev/Tests: frisches In-Memory-SQLite (siehe sequelize.ts) – sync() baut die
			// Tabellen bei jedem Prozessstart dialektfrei aus den Modellen auf. Dass
			// Migrationen und Modelle dasselbe Schema ergeben, sichert migrations.spec.ts.
			// Sauberkeit zwischen E2E-Tests stellt der /api/test/reset-Endpoint her.
			await sequelize.sync();
		}
		dbStarted = true;
	} catch (error) {
		// Fail-fast: ohne DB (oder mit fehlgeschlagener Migration) darf der Server nicht
		// "erfolgreich" starten und dann auf jedem Request werfen. Der Fehler propagiert
		// durch das Top-Level-await in hooks.server.ts → Prozess startet nicht; Supervisor
		// + Health-Check im Deploy machen das sichtbar.
		console.error('Unable to start the database:', error);
		throw error;
	}
}
