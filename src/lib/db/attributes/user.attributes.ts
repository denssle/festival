import type { BackendUser } from '$lib/models/user/BackendUser';

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
