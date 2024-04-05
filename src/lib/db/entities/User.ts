import { sequelize } from '$lib/db/db';
import { DataTypes, Model, ModelStatic } from 'sequelize';

type UserAttributes = {
	id: string;
	password: string;
	created: Date;
	nickname: string;
	forename: string;
	lastname: string;
	email: string;
}

export const User: ModelStatic<Model<UserAttributes, any>> = sequelize.define('User', {
	id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
	password: { type: DataTypes.STRING, allowNull: false },
	created: { type: DataTypes.DATE },
	nickname: { type: DataTypes.STRING },
	forename: { type: DataTypes.STRING },
	lastname: { type: DataTypes.STRING },
	email: { type: DataTypes.STRING }
});