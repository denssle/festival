import type { Optional } from 'sequelize';

export type FriendAttributes = {
	id: string;
	friend1Id: string;
	friend2Id: string;
	createdAt: Date;
	updatedAt: Date;
};

/** Attribute beim Anlegen: Zeitstempel setzt Sequelize. */
export type FriendCreationAttributes = Optional<FriendAttributes, 'createdAt' | 'updatedAt'>;
