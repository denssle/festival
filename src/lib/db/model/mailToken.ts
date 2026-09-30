import { DataTypes, Model, ModelStatic } from 'sequelize';
import {
	MAIL_TOKEN_PURPOSES,
	MailTokenAttributes,
	MailTokenCreationAttributes
} from '$lib/db/attributes/mailToken.attributes';

import { sequelize } from '$lib/db/sequelize';

export const MailToken: ModelStatic<Model<MailTokenAttributes, MailTokenCreationAttributes>> = sequelize.define(
	'mailToken',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		UserId: { type: DataTypes.STRING, allowNull: false },
		purpose: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: { isIn: [MAIL_TOKEN_PURPOSES as string[]] }
		},
		tokenHash: { type: DataTypes.STRING, allowNull: false, unique: true },
		email: { type: DataTypes.STRING },
		expiresAt: { type: DataTypes.DATE, allowNull: false }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);
