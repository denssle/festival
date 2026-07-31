import { DataTypes, Model, ModelStatic } from 'sequelize';
import { UserAttributes, UserCreationAttributes } from '$lib/db/attributes/user.attributes';

import { sequelize } from '$lib/db/sequelize';

export const User: ModelStatic<Model<UserAttributes, UserCreationAttributes>> = sequelize.define(
	'user',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		password: { type: DataTypes.STRING, allowNull: false },
		// unique: Eindeutigkeit muss die DB erzwingen – die check-then-create-Prüfungen
		// in den Services sind bei parallelen Requests nicht ausreichend (Race Condition).
		nickname: { type: DataTypes.STRING, allowNull: false, unique: true },
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
