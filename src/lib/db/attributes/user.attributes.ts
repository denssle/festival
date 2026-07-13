import type { BackendUser } from '$lib/models/user/BackendUser';
import type { Optional } from 'sequelize';

export type UserAttributes = {
	id: string;
	password: string;
	nickname: string;
	forename: string;
	lastname: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * Attribute beim Anlegen (2. Generic von `Model<TAttributes, TCreationAttributes>`):
 * Zeitstempel setzt Sequelize, die restlichen Felder sind in der Model-Definition
 * `allowNull` (siehe src/lib/db/model/user.ts).
 */
export type UserCreationAttributes = Optional<
	UserAttributes,
	'createdAt' | 'updatedAt' | 'forename' | 'lastname' | 'email'
>;

export function convertToBackendUser(dataValues: UserAttributes): BackendUser {
	return {
		id: dataValues.id,
		email: dataValues.email,
		nickname: dataValues.nickname,
		forename: dataValues.forename,
		lastname: dataValues.lastname,
		updatedAt: dataValues.updatedAt,
		createdAt: dataValues.createdAt,
		password: dataValues.password
	};
}
