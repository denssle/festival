import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { MARIA_DB_PASSWORD, MARIA_DB_USER } from '$env/static/private';
import { GuestInformationAttributes } from '$lib/db/attributes/guestInformation.attributes';
import { UserAttributes } from '$lib/db/attributes/user.attributes';
import { FestivalEventAttributes } from '$lib/db/attributes/festivalEvent.attributes';
import { FriendAttributes } from '$lib/db/attributes/friend.attributes';
import { FriendRequestAttributes } from '$lib/db/attributes/friendRequest.attributes';
import { UserImageAttributes } from '$lib/db/attributes/userImage.attributes';
import { SessionTokenAttributes } from '$lib/db/attributes/sessionToken.attributes';
import { CommentAttributes } from '$lib/db/attributes/comment.attributes';
import { GroupAttributes } from '$lib/db/attributes/group.attributes';
import { GroupMemberAttributes } from '$lib/db/attributes/groupMember.attributes';

const sequelize: Sequelize = new Sequelize({
	dialect: 'mariadb',
	host: 'localhost',
	username: MARIA_DB_USER,
	password: MARIA_DB_PASSWORD,
	database: MARIA_DB_USER,
	define: {}
});

export const User: ModelStatic<Model<UserAttributes, any>> = sequelize.define(
	'user',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		password: { type: DataTypes.STRING, allowNull: false },
		nickname: { type: DataTypes.STRING, allowNull: false },
		forename: { type: DataTypes.STRING },
		lastname: { type: DataTypes.STRING },
		email: { type: DataTypes.STRING }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const UserImage: ModelStatic<Model<UserImageAttributes, any>> = sequelize.define(
	'userImage',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		image: { type: DataTypes.BLOB('long'), allowNull: false }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const GuestInformation: ModelStatic<Model<GuestInformationAttributes, any>> = sequelize.define(
	'guestInformation',
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		food: { type: DataTypes.STRING },
		drink: { type: DataTypes.STRING },
		numberOfOtherGuests: { type: DataTypes.INTEGER },
		coming: { type: DataTypes.BOOLEAN },
		comment: { type: DataTypes.STRING },
		FestivalEventId: { type: DataTypes.STRING, allowNull: false },
		UserId: { type: DataTypes.STRING, allowNull: false }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const FestivalEvent: ModelStatic<Model<FestivalEventAttributes, any>> = sequelize.define(
	'festivalEvent',
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: { type: DataTypes.STRING },
		location: { type: DataTypes.STRING },
		bringYourOwnBottle: { type: DataTypes.BOOLEAN },
		bringYourOwnFood: { type: DataTypes.BOOLEAN },
		startDate: { type: DataTypes.DATE },
		UserId: { type: DataTypes.STRING, allowNull: false }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const Friend: ModelStatic<Model<FriendAttributes, any>> = sequelize.define(
	'friend',
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		friend1Id: {
			type: DataTypes.STRING,
			allowNull: false
		},
		friend2Id: {
			type: DataTypes.STRING,
			allowNull: false
		}
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const FriendRequest: ModelStatic<Model<FriendRequestAttributes, any>> = sequelize.define(
	'friendRequest',
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		senderId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		receiverId: {
			type: DataTypes.STRING,
			allowNull: false
		}
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const SessionToken: ModelStatic<Model<SessionTokenAttributes, any>> = sequelize.define(
	'sessionToken',
	{
		UserId: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false
		}
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const Comment: ModelStatic<Model<CommentAttributes, any>> = sequelize.define(
	'comment',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		writtenBy: { type: DataTypes.STRING, allowNull: false },
		writtenTo: { type: DataTypes.STRING, allowNull: false },
		comment: { type: DataTypes.STRING }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const Group: ModelStatic<Model<GroupAttributes, any>> = sequelize.define(
	'group',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.STRING }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const GroupMember: ModelStatic<Model<GroupMemberAttributes, any>> = sequelize.define(
	'groupMember',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

FestivalEvent.hasMany(GuestInformation);
GuestInformation.belongsTo(FestivalEvent);

User.hasMany(UserImage, { onDelete: 'CASCADE' });
UserImage.belongsTo(User);

User.hasMany(GuestInformation, { onDelete: 'CASCADE' });
GuestInformation.belongsTo(User);

User.hasMany(FestivalEvent, { onDelete: 'CASCADE' });
FestivalEvent.belongsTo(User);

// Many to many??
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
