import type { Optional } from 'sequelize';

export interface CommentAttributes {
	id: string;
	writtenBy: string;
	writtenTo: string;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
}

/** Attribute beim Anlegen: Pflicht sind nur `id`, `writtenBy` und `writtenTo`. */
export type CommentCreationAttributes = Optional<CommentAttributes, 'createdAt' | 'updatedAt' | 'comment'>;
