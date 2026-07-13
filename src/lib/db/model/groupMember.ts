import { DataTypes, Model, ModelStatic } from 'sequelize';
import { GroupMemberAttributes, GroupMemberCreationAttributes } from '$lib/db/attributes/groupMember.attributes';
import { sequelize } from '$lib/db/sequelize';

export const GroupMember: ModelStatic<Model<GroupMemberAttributes, GroupMemberCreationAttributes>> = sequelize.define(
	'groupMember',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		GroupId: { type: DataTypes.STRING, allowNull: false },
		UserId: { type: DataTypes.STRING, allowNull: false }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);
