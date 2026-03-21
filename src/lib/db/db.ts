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

FestivalEvent.hasMany(GuestInformation, { onDelete: 'CASCADE' });
GuestInformation.belongsTo(FestivalEvent);

User.hasMany(GuestInformation, { onDelete: 'CASCADE' });
GuestInformation.belongsTo(User);

User.hasMany(FestivalEvent, { onDelete: 'CASCADE' });
FestivalEvent.belongsTo(User);

User.hasOne(UserImage, { onDelete: 'CASCADE' });
UserImage.belongsTo(User);

// TODO Check: Many to many??
User.belongsToMany(User, {
	through: Friendship,
	as: 'friends',
	foreignKey: 'friend1Id',
	otherKey: 'friend2Id',
	onDelete: 'CASCADE'
});

User.hasMany(FriendRequest, {
	foreignKey: 'senderId',
	onDelete: 'CASCADE'
});
FriendRequest.belongsTo(User, {
	as: 'receiver'
});

// TODO multiple sessions?
User.hasOne(SessionToken, { onDelete: 'CASCADE' });
SessionToken.belongsTo(User);

User.hasMany(Group, { as: 'ownedGroups', foreignKey: 'ownerId', onDelete: 'CASCADE' });
Group.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

Group.belongsToMany(User, { through: GroupMember, as: 'members' });
User.belongsToMany(Group, { through: GroupMember, as: 'joinedGroups' });

Group.hasMany(GroupMember, { onDelete: 'CASCADE' });
GroupMember.belongsTo(Group);

User.hasMany(GroupMember, { onDelete: 'CASCADE' });
GroupMember.belongsTo(User);

export async function startDB(): Promise<void> {
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
		await sequelize.sync({ force: false, alter: true });
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
}
