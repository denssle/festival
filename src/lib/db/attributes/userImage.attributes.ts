import type { Optional } from 'sequelize';

export type UserImageAttributes = {
	id: string;
	UserId: string;
	image: Buffer;
	createdAt: Date;
	updatedAt: Date;
};

/** Attribute beim Anlegen: Zeitstempel setzt Sequelize. */
export type UserImageCreationAttributes = Optional<UserImageAttributes, 'createdAt' | 'updatedAt'>;
