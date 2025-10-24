import { DataTypes, Model, ModelStatic } from 'sequelize';
import { GroupAttributes } from '$lib/db/attributes/group.attributes';

import { sequelize } from '$lib/db/model/sequelize';

export const Group: ModelStatic<Model<GroupAttributes, any>> = sequelize.define(
	'group',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.STRING }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);
