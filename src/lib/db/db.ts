import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { MARIA_DB_PASSWORD, MARIA_DB_USER } from '$env/static/private';
import { GuestInformationAttributes } from '$lib/db/attributes/GuestInformationAttributes';
import { UserAttributes } from '$lib/db/attributes/UserAttributes';
import { FestivalEventAttributes } from '$lib/db/attributes/FestivalEventAttributes';
import { FriendAttributes } from '$lib/db/attributes/FriendAttributes';
import { FriendRequestAttributes } from '$lib/db/attributes/FriendRequestAttributes';
import { UserImageAttributes } from '$lib/db/attributes/UserImageAttributes';
import { SessionTokenAttributes } from '$lib/db/attributes/SessionTokenAttributes';
import { CommentAttributes } from '$lib/db/attributes/CommentAttributes';

const sequelize: Sequelize = new Sequelize({
	dialect: 'mariadb',
	host: 'localhost',
	username: MARIA_DB_USER,
	password: MARIA_DB_PASSWORD,
	database: MARIA_DB_USER,
	define: {}
});

export const User: ModelStatic<Model<UserAttributes, any>> = sequelize.define(
	'User',
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
	'UserImage',
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
	'GuestInformation',
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
	'FestivalEvent',
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
	'Friend',
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
		},
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const FriendRequest: ModelStatic<Model<FriendRequestAttributes, any>> = sequelize.define(
	'FriendRequest',
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
		},
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);

export const SessionToken: ModelStatic<Model<SessionTokenAttributes, any>> = sequelize.define(
	'SessionToken',
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
	'Comment',
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

FestivalEvent.hasMany(GuestInformation);
GuestInformation.belongsTo(FestivalEvent);

User.hasMany(UserImage);
UserImage.belongsTo(User);

User.hasMany(GuestInformation);
GuestInformation.belongsTo(User);

User.hasMany(FestivalEvent);
FestivalEvent.belongsTo(User);

User.hasMany(Friend, {
	foreignKey: 'friend1Id'
});
Friend.belongsTo(User, {
	as: 'friend2'
});

User.hasMany(FriendRequest, {
	foreignKey: 'senderId'
});
FriendRequest.belongsTo(User, {
	as: 'receiver'
});

User.hasOne(SessionToken);
SessionToken.belongsTo(User);

export async function startDB(): Promise<void> {
	await sequelize.sync({ force: false });
}
