import { DataTypes, Model, ModelStatic } from 'sequelize';
import { UserAttributes } from '$lib/db/attributes/user.attributes';

import { sequelize } from '$lib/db/sequelize';

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
