import { User } from '$lib/db/model/user';
import { UserImage } from '$lib/db/model/userImage';
import { GuestInformation } from '$lib/db/model/guestInformation';
import { SessionToken } from '$lib/db/model/sessionToken';
import { Group } from '$lib/db/model/group';
import { FestivalEvent } from '$lib/db/model/festivalEvent';
import { sequelize } from '$lib/db/sequelize';
import { FriendRequest } from '$lib/db/model/friendRequest';
import { GroupMember } from '$lib/db/model/groupMember';
import { Friendship } from '$lib/db/model/friendship';
import { Comment } from '$lib/db/model/comment';
import { env } from '$env/dynamic/private';
const { MARIA_DB_NAME } = env;

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
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');

		const isSyncForced = process.env.PLAYWRIGHT === 'true' || process.env.NODE_ENV === 'test' || MARIA_DB_NAME == 'dev';
		// force und alter schließen sich gegenseitig aus: bei force wird die Tabelle ohnehin neu erstellt,
		// alter greift nur beim nicht-forcierten Sync (Produktion).
		await sequelize.sync(isSyncForced ? { force: true } : { alter: true });
		dbStarted = true;
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
}
