import { DataTypes, Model, ModelStatic } from 'sequelize';
import { GroupMemberAttributes } from '$lib/db/attributes/groupMember.attributes';
import { sequelize } from '$lib/db/sequelize';

export const Friendship: ModelStatic<Model<GroupMemberAttributes, any>> = sequelize.define(
	'friendship',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);
