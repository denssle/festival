import { DataTypes, Model, ModelStatic } from 'sequelize';
import { UserImageAttributes } from '$lib/db/attributes/userImage.attributes';

import { sequelize } from '$lib/db/sequelize';

export const UserImage: ModelStatic<Model<UserImageAttributes, any>> = sequelize.define(
	'userImage',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		UserId: { type: DataTypes.STRING, allowNull: false },
		image: { type: DataTypes.BLOB('long'), allowNull: false }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);
