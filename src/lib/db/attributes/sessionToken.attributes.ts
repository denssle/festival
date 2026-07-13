import type { Optional } from 'sequelize';

export interface SessionTokenAttributes {
	token: string;
	UserId: string;
	createdAt: Date;
	updatedAt: Date;
}

/** Attribute beim Anlegen: Zeitstempel setzt Sequelize. */
export type SessionTokenCreationAttributes = Optional<SessionTokenAttributes, 'createdAt' | 'updatedAt'>;
