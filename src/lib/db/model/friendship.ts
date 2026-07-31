import { DataTypes, Model, ModelStatic } from 'sequelize';
import { FriendAttributes, FriendCreationAttributes } from '$lib/db/attributes/friend.attributes';
import { sequelize } from '$lib/db/sequelize';

export const Friendship: ModelStatic<Model<FriendAttributes, FriendCreationAttributes>> = sequelize.define(
	'friendship',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		friend1Id: { type: DataTypes.STRING, allowNull: false },
		friend2Id: { type: DataTypes.STRING, allowNull: false }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true,
		// Deckt nur die Richtung (friend1Id, friend2Id) ab – die gespiegelte Zeile
		// (friend2Id, friend1Id) bleibt auf DB-Ebene erlaubt und wird in
		// FriendshipService.addFriend per areFriends-Prüfung verhindert.
		indexes: [{ unique: true, fields: ['friend1Id', 'friend2Id'] }]
	}
);
