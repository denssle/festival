import { DataTypes, Model, ModelStatic } from 'sequelize';
import { SessionTokenAttributes } from '$lib/db/attributes/sessionToken.attributes';

import { sequelize } from '$lib/db/model/sequelize';

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
