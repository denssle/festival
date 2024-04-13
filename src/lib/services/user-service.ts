import { compareSync, genSaltSync, hashSync } from 'bcrypt-ts';
import type { BackendUser } from '../models/user/BackendUser';
import type { FrontendUser } from '../models/user/FrontendUser';
import type { UserFormData } from '$lib/models/user/UserFormData';
import type { Cookies } from '@sveltejs/kit';
import { Friend, User } from '$lib/db/db';
import { convertToBackendUser } from '$lib/db/attributes/UserAttributes';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { Op } from 'sequelize';

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

export async function validateSessionToken(userString: string | undefined): Promise<boolean> {
	// TODO Check token age
	const user: SessionTokenUser | null = extractUser(userString);
	if (user) {
		const found: BackendUser | null = await loadUserById(user.id);
		if (found && found.password) {
			return found.password === user.password;
		} else {
			console.error('session validation: no user in db found', user);
		}
	}
	return false;
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
		createdAt: user.createdAt,
		image: user.image
	};
}

export function parseSessionUserToFrontEnd(user: SessionTokenUser): FrontendUser {
	return {
		id: user.id,
		nickname: user.nickname,
		image: 'not set in token',
		forename: 'not set in token',
		lastname: 'not set in token',
		email: 'not set in token',
		createdAt: new Date(),
		updatedAt: new Date()
	};
}

export async function readFormDataFrontEndUser(data: Promise<FormData>): Promise<UserFormData> {
	const values: FormData = await data;
	return {
		email: String(values.get('email')),
		nickname: String(values.get('nickname')),
		forename: String(values.get('forename')),
		lastname: String(values.get('lastname')),
		password: String(values.get('password'))
	};
}

export function createSessionCookie(cookies: Cookies, user: BackendUser | SessionTokenUser): void {
	// TODO: Nicht das Password rausgeben
	cookies.set(
		'session',
		JSON.stringify({
			id: user.id,
			password: user.password,
			nickname: user.nickname
		} as SessionTokenUser),
		{
			path: '/',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 30
		}
	);
}

export async function updateUser(oldUser: SessionTokenUser, formData: UserFormData): Promise<SessionTokenUser> {
	const model = await User.findByPk(oldUser.id);
	if (model) {
		model.set({
			email: formData.email,
			lastname: formData.lastname,
			forename: formData.forename,
			password: formData.password ? saltPassword(formData.password) : oldUser.password
		});
		const saved = await model.save();
		return convertToBackendUser(saved.dataValues);
	}
	return oldUser;
}

export async function saveUserImage(userId: string, image: string): Promise<string> {
	const model = await User.findByPk(userId);
	if (model) {
		model.set({
			image: image
		});
		await model.save();
	}
	return image;
}

export async function getUserImage(userId: string): Promise<string | null> {
	const model = await User.findByPk(userId);
	return model ? model.dataValues.image : null;
}

export async function addFriend(userId: string, userId2: string): Promise<void> {
	await Friend.create({
		id: crypto.randomUUID(),
		friend1Id: userId,
		friend2Id: userId2
	});
}

export async function getFriends(userId: string): Promise<{ id: string; friend1Id: string; friend2Id: string }[]> {
	const model = await Friend.findAll({
		where: {
			[Op.or]: [
				{
					friend1Id: userId
				},
				{
					friend2Id: userId
				}
			]
		}
	});
	return model.map((value) => value.dataValues);
}

export async function getFriendList(userId: string): Promise<(FrontendUser | undefined)[]> {
	const friends: { id: string; friend1Id: string; friend2Id: string }[] = await getFriends(userId);
	return await Promise.all(friends.map(value => {
		if (value.friend1Id === userId) {
			return loadFrontEndUserById(value.friend2Id);
		} else {
			return loadFrontEndUserById(value.friend1Id);
		}
	}).filter(value => Boolean(value)));

}

export async function areFriends(userId: string, userId2: string): Promise<boolean> {
	return Boolean(Friend.findOne({
		where: {
			[Op.or]: [
				{
					friend1Id: [userId, userId2]
				},
				{
					friend2Id: [userId, userId2]
				}
			]
		}
	}));
}
