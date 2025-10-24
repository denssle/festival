import { DataTypes, Model, ModelStatic } from 'sequelize';
import { FriendRequestAttributes } from '$lib/db/attributes/friendRequest.attributes';
import { sequelize } from '$lib/db/model/sequelize';

export const FriendRequest: ModelStatic<Model<FriendRequestAttributes, any>> = sequelize.define(
	'friendRequest',
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
		}
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);
