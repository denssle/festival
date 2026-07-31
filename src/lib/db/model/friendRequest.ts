import { DataTypes, Model, ModelStatic } from 'sequelize';
import { FriendRequestAttributes, FriendRequestCreationAttributes } from '$lib/db/attributes/friendRequest.attributes';
import { sequelize } from '$lib/db/sequelize';

export const FriendRequest: ModelStatic<Model<FriendRequestAttributes, FriendRequestCreationAttributes>> =
	sequelize.define(
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
			updatedAt: true,
			// Deckt nur die Richtung (senderId, receiverId) ab – die Gegenrichtung wird
			// in FriendshipService.createFriendRequest per friendRequestExisting geprüft.
			indexes: [{ unique: true, fields: ['senderId', 'receiverId'] }]
		}
	);
