import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { MARIA_DB_PASSWORD, MARIA_DB_USER } from '$env/static/private';
import { GuestInformationAttributes } from '$lib/db/entities/GuestInformation';
import { UserAttributes } from '$lib/db/entities/User';
import { FestivalEventAttributes } from '$lib/db/entities/FestivalEvent';

const sequelize: Sequelize = new Sequelize({
	dialect: 'mariadb',
	host: 'localhost',
	username: MARIA_DB_USER,
	password: MARIA_DB_PASSWORD,
	database: MARIA_DB_USER,
	define: {}
});

export const User: ModelStatic<Model<UserAttributes, any>> = sequelize.define('User', {
	id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
	password: { type: DataTypes.STRING, allowNull: false },
	created: { type: DataTypes.DATE },
	nickname: { type: DataTypes.STRING },
	forename: { type: DataTypes.STRING },
	lastname: { type: DataTypes.STRING },
	email: { type: DataTypes.STRING }
});

export const GuestInformation: ModelStatic<Model<GuestInformationAttributes, any>> = sequelize.define(
	'GuestInformation',
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		festivalEventId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		food: { type: DataTypes.STRING },
		drink: { type: DataTypes.STRING },
		numberOfOtherGuests: { type: DataTypes.INTEGER },
		coming: { type: DataTypes.BOOLEAN },
		comment: { type: DataTypes.STRING }
	}
);

export const FestivalEvent: ModelStatic<Model<FestivalEventAttributes, any>> = sequelize.define('FestivalEvent', {
	id: {
		type: DataTypes.STRING,
		primaryKey: true,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	description: {
		type: DataTypes.STRING
	},
	location: {
		type: DataTypes.STRING
	},
	bringYourOwnBottle: {
		type: DataTypes.BOOLEAN
	},
	bringYourOwnFood: {
		type: DataTypes.BOOLEAN
	},
	createdBy: {
		type: DataTypes.STRING
	},
	createdAt: {
		type: DataTypes.DATE
	},
	updatedBy: {
		type: DataTypes.STRING
	},
	updatedAt: {
		type: DataTypes.DATE
	},
	startDate: {
		type: DataTypes.DATE
	}
});

FestivalEvent.hasOne(GuestInformation, {
	foreignKey: 'festivalEventId'
});
GuestInformation.belongsTo(FestivalEvent);

export async function startDB() {
	await sequelize.sync({ force: true });
}
