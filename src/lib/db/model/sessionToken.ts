import { DataTypes, Model, ModelStatic } from 'sequelize';
import { SessionTokenAttributes, SessionTokenCreationAttributes } from '$lib/db/attributes/sessionToken.attributes';

import { sequelize } from '$lib/db/sequelize';

export const SessionToken: ModelStatic<Model<SessionTokenAttributes, SessionTokenCreationAttributes>> =
	sequelize.define(
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
