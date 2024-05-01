import { compareSync, genSaltSync, hashSync } from 'bcrypt-ts';
import type { BackendUser } from '../models/user/BackendUser';
import type { FrontendUser } from '../models/user/FrontendUser';
import type { UserFormData } from '$lib/models/user/UserFormData';
import type { Cookies } from '@sveltejs/kit';
import { SessionToken, User, UserImage } from '$lib/db/db';
import { convertToBackendUser, UserAttributes } from '$lib/db/attributes/UserAttributes';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { Model } from 'sequelize';
import { UserImageAttributes } from '$lib/db/attributes/UserImageAttributes';
import { NickPassData } from '$lib/models/user/NickPassData';
import { SessionTokenAttributes } from '$lib/db/attributes/SessionTokenAttributes';

async function getByNickname(nickname: string) {
	return await User.findOne({
		where: {
			nickname: nickname
		}
	});
}

export async function register(nickname: string, password: string): Promise<BackendUser | null> {
	if (!(await nickNameInvalid(nickname))) {
		const model = await User.create({
			id: crypto.randomUUID(),
			nickname: nickname,
			password: saltPassword(password)
		});
		return convertToBackendUser(model.dataValues);
	}
	return null;
}

export function saltPassword(password: string): string {
	return hashSync(password, genSaltSync(4));
}

export async function login(nickname: string, password: string): Promise<BackendUser | null> {
	const user: BackendUser | null = await loadUserByNickname(nickname);
	if (user && user.password) {
		if (compareSync(password, user.password)) {
			return user;
		}
	}
	return null;
}

export async function logout(user: SessionTokenUser): Promise<number> {
	return SessionToken.destroy({
		where: {
			UserId: user.id,
			token: user.token
		}
	});
}

export async function validateSessionToken(userString: string | undefined): Promise<boolean> {
	const user: SessionTokenUser | null = extractUser(userString);
	if (user) {
		const found: SessionTokenAttributes | undefined = await loadToken(user.id);
		if (found && found.token) {
			// TODO Check token age
			return found.token === user.token;
		} else {
			console.error('session validation: no user in db found', user);
		}
	}
	return false;
}

async function loadToken(userId: string): Promise<SessionTokenAttributes | undefined> {
	const model = await SessionToken.findOne({
		where: {
			UserId: userId
		}
	});
	return model?.dataValues;
}

export function extractUser(sessionToken: string | undefined): SessionTokenUser | null {
	if (sessionToken) {
		try {
			const maybeUser: SessionTokenUser = JSON.parse(sessionToken);
			if (maybeUser) {
				return maybeUser;
			} else {
				console.error('User parsing failed!');
			}
		} catch (e) {
			console.error('error parsing user', e);
		}
		return null;
	}
	return null;
}

export async function nickNameInvalid(nickname: string): Promise<boolean> {
	return !nickname || nickname.length === 0 || Boolean(await getByNickname(nickname));
}

async function loadUserByNickname(nickname: string): Promise<BackendUser | null> {
	const model = await getByNickname(nickname);
	if (model) {
		return convertToBackendUser(model.dataValues);
	}
	return null;
}

async function loadUserById(userId: string): Promise<BackendUser | null> {
	const value = await User.findByPk(userId);
	if (value) {
		return convertToBackendUser(value.dataValues);
	}
	return null;
}

export async function loadFrontEndUserById(id: string | null): Promise<FrontendUser | undefined> {
	if (id) {
		const byId: BackendUser | null = await loadUserById(id);
		if (byId) {
			return parseBackendUserToFrontend(byId);
		}
	}
}

export function parseBackendUserToFrontend(user: BackendUser): FrontendUser {
	return {
		id: user.id,
		nickname: user.nickname,
		forename: user.forename,
		lastname: user.lastname,
		email: user.email,
		updatedAt: user.updatedAt,
		createdAt: user.createdAt
	};
}

export async function readFormDataFrontEndUser(data: Promise<FormData>): Promise<UserFormData> {
	const values: FormData = await data;
	return {
		email: String(values.get('email')),
		nickname: String(values.get('nickname')),
		forename: String(values.get('forename')),
		lastname: String(values.get('lastname'))
	};
}

export async function readNickPass(data: Promise<FormData>): Promise<NickPassData | undefined> {
	const values: FormData = await data;
	const nickname = String(values.get('nickname'));
	const password = String(values.get('password'));
	if (nickname && password) {
		return {
			nickname: nickname,
			password: password
		};
	}
}

export async function createSessionCookie(cookies: Cookies, user: BackendUser | SessionTokenUser): Promise<void> {
	const token: string = crypto.randomUUID();
	await SessionToken.upsert({
		UserId: user.id,
		token: token
	});
	cookies.set(
		'session',
		JSON.stringify({
			id: user.id,
			token: token,
			nickname: user.nickname
		} as SessionTokenUser),
		{
			path: '/',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 30
		}
	);
}

export async function updateUser(oldUser: SessionTokenUser, formData: UserFormData): Promise<boolean> {
	const model: Model<UserAttributes, any> | null = await User.findByPk(oldUser.id);
	if (model) {
		model.set({
			email: formData.email,
			lastname: formData.lastname,
			forename: formData.forename
		});
		await model.save();
		return true;
	}
	return false;
}

export async function updatePassword(oldUser: SessionTokenUser, password: string): Promise<boolean> {
	const model: Model<UserAttributes, any> | null = await User.findByPk(oldUser.id);
	if (model) {
		model.set({
			password: saltPassword(password)
		});
		await model.save();
		return true;
	}
	return false;
}

export async function saveUserImage(userId: string, image: string): Promise<string> {
	await UserImage.findOne({ where: { UserId: userId } }).then(function(model: Model<UserImageAttributes, any> | null) {
		if (model) {
			return model.update({ image: Buffer.from(image) });
		}
		return UserImage.create({ id: crypto.randomUUID(), UserId: userId, image: Buffer.from(image) });
	});
	return image;
}

export async function getUserImage(userId: string): Promise<string | null> {
	const model: Model<UserImageAttributes, any> | null = await UserImage.findOne({ where: { UserId: userId } });
	return model ? model.dataValues.image.toString() : null;
}
