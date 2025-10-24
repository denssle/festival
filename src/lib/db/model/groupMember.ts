import { DataTypes, Model, ModelStatic } from 'sequelize';
import { GroupMemberAttributes } from '$lib/db/attributes/groupMember.attributes';
import { sequelize } from '$lib/db/sequelize';

export const GroupMember: ModelStatic<Model<GroupMemberAttributes, any>> = sequelize.define(
	'groupMember',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);
