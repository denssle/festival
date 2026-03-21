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
import { hash } from 'bcrypt-ts';

FestivalEvent.hasMany(GuestInformation, { as: 'GuestInformations', onDelete: 'CASCADE' });
GuestInformation.belongsTo(FestivalEvent);

User.hasMany(GuestInformation, { foreignKey: 'UserId', onDelete: 'CASCADE' });
GuestInformation.belongsTo(User, { foreignKey: 'UserId' });

User.hasMany(FestivalEvent, { foreignKey: 'UserId', onDelete: 'CASCADE' });
FestivalEvent.belongsTo(User, { foreignKey: 'UserId' });

User.hasOne(UserImage, { onDelete: 'CASCADE' });
UserImage.belongsTo(User);

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
User.hasOne(SessionToken, { foreignKey: 'UserId', onDelete: 'CASCADE' });
SessionToken.belongsTo(User, { foreignKey: 'UserId' });

User.hasMany(Group, { as: 'ownedGroups', foreignKey: 'ownerId', onDelete: 'CASCADE' });
Group.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

Group.belongsToMany(User, { through: GroupMember, as: 'members' });
User.belongsToMany(Group, { through: GroupMember, as: 'joinedGroups' });

Group.hasMany(GroupMember, { onDelete: 'CASCADE' });
GroupMember.belongsTo(Group);

User.hasMany(GroupMember, { onDelete: 'CASCADE' });
GroupMember.belongsTo(User);

User.hasMany(Comment, { foreignKey: 'writtenBy', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'writtenBy' });

export async function startDB(): Promise<void> {
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
		await sequelize.sync({ force: false, alter: true });

		// Seed TestUser for Playwright tests if in test mode
		if (process.env.PLAYWRIGHT === 'true' || process.env.NODE_ENV === 'test') {
			const testNickname = 'TestUser';
			const testPassword = 'TestPassword123';
			const existingUser = await User.findOne({ where: { nickname: testNickname } });
			if (!existingUser) {
				const hashedPassword = await hash(testPassword, 10);
				await User.create({
					id: crypto.randomUUID(),
					nickname: testNickname,
					password: hashedPassword
				});
				console.log('TestUser seeded for In-Memory Database.');
			}
		}
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
}
