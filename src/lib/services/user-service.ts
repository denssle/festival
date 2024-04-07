import { compareSync, genSaltSync, hashSync } from 'bcrypt-ts';
import type { BackendUser } from '../models/user/BackendUser';
import type { FrontendUser } from '../models/user/FrontendUser';
import type { UserFormData } from '$lib/models/user/UserFormData';
import type { Cookies } from '@sveltejs/kit';
import { User } from '$lib/db/db';
import { convertToBackendUser } from '$lib/db/entities/UserAttributes';

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
	const user: BackendUser | null = extractUser(userString);
	if (user) {
		const found: BackendUser | null = await loadUserById(user.id);
		if (found && found.password) {
			return found.password === user.password;
		} else {
			console.error('session validation: no user in db found', found);
		}
	}
	return false;
}

export function extractUser(sessionToken: string | undefined): BackendUser | null {
	if (sessionToken) {
		return parseStringToUser(sessionToken);
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
			return parseToFrontEnd(byId);
		}
	}
}

function parseStringToUser(data: string): BackendUser | null {
	try {
		const maybeUser: BackendUser = JSON.parse(data);
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

export function parseToFrontEnd(user: BackendUser): FrontendUser {
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
		lastname: String(values.get('lastname')),
		password: String(values.get('password'))
	};
}

export function createSessionCookie(cookies: Cookies, user: BackendUser): void {
	// TODO: nicht den ganzen BackendUser speichern
	cookies.set('session', JSON.stringify(user), {
		path: '/',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 30
	});
}

export async function updateUser(oldUser: BackendUser, formData: UserFormData): Promise<BackendUser> {
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
}

export async function saveUserImage(userId: string, image: string): Promise<string> {
	// TODO
	return image;
}

export async function getUserImage(userId: string): Promise<string | null> {
	// TODO
	return userId;
}
