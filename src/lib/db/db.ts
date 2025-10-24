import { User } from '$lib/db/model/user';
import { UserImage } from '$lib/db/model/userImage';
import { GuestInformation } from '$lib/db/model/guestInformation';
import { Friend } from '$lib/db/model/friend';
import { SessionToken } from '$lib/db/sessionToken';
import { Group } from '$lib/db/model/group';
import { FestivalEvent } from '$lib/db/model/festivalEvent';
import { sequelize } from '$lib/db/model/sequelize';
import { FriendRequest } from '$lib/db/model/friendRequest';
import { GroupMember } from '$lib/db/model/groupMember';

FestivalEvent.hasMany(GuestInformation);
GuestInformation.belongsTo(FestivalEvent);

User.hasOne(UserImage, { onDelete: 'CASCADE' });
UserImage.belongsTo(User);

User.hasMany(GuestInformation, { onDelete: 'CASCADE' });
GuestInformation.belongsTo(User);

User.hasMany(FestivalEvent, { onDelete: 'CASCADE' });
FestivalEvent.belongsTo(User);

// TODO Check: Many to many??
User.hasMany(Friend, {
	foreignKey: 'friend1Id',
	onDelete: 'CASCADE'
});
Friend.belongsTo(User, {
	as: 'friend2'
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

User.hasMany(Group, { onDelete: 'SET NULL' });
Group.belongsTo(User);

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
