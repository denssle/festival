import { DataTypes, Model, ModelStatic } from 'sequelize';
import { CommentAttributes, CommentCreationAttributes } from '$lib/db/attributes/comment.attributes';

import { sequelize } from '$lib/db/sequelize';

export const Comment: ModelStatic<Model<CommentAttributes, CommentCreationAttributes>> = sequelize.define(
	'comment',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		writtenBy: { type: DataTypes.STRING, allowNull: false },
		writtenTo: { type: DataTypes.STRING, allowNull: false },
		comment: { type: DataTypes.STRING }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);
