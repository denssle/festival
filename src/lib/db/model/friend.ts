import { DataTypes, Model, ModelStatic } from 'sequelize';
import { FriendAttributes } from '$lib/db/attributes/friend.attributes';

import { sequelize } from '$lib/db/model/sequelize';

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
