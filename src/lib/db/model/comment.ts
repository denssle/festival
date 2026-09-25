import { DataTypes, Model, ModelStatic } from 'sequelize';
import { CommentAttributes, CommentCreationAttributes } from '$lib/db/attributes/comment.attributes';

import { sequelize } from '$lib/db/sequelize';

export const Comment: ModelStatic<Model<CommentAttributes, CommentCreationAttributes>> = sequelize.define(
	'comment',
	{
		id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
		writtenBy: { type: DataTypes.STRING, allowNull: false },
		// Genau eines der beiden Ziele ist gesetzt (siehe comment.attributes.ts).
		FestivalEventId: { type: DataTypes.STRING, allowNull: true },
		ProfileUserId: { type: DataTypes.STRING, allowNull: true },
		comment: { type: DataTypes.TEXT }
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true,
		validate: {
			// Die DB-Absicherung (CHECK) gibt es nur in MariaDB, siehe Migration 0003.
			// Dieser Validator greift in beiden Dialekten, bevor die Zeile die DB erreicht.
			exactlyOneTarget(this: CommentAttributes) {
				if ((this.FestivalEventId == null) === (this.ProfileUserId == null)) {
					throw new Error('Ein Kommentar braucht genau ein Ziel: Festival oder Nutzerprofil.');
				}
			}
		}
	}
);
