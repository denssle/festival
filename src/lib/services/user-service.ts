import { compareSync, genSaltSync, hashSync } from 'bcrypt-ts';
import type { BackendUser } from '../models/BackendUser';
import redis from '../redis';
import type { FrontendUser } from '../models/FrontendUser';
import type { UserFormData } from '$lib/models/UserFormData';
import type { Cookies } from '@sveltejs/kit';

const USER: string = 'user:';
const USER_IMG: string = 'user-img:';

export async function register(nickname: string, password: string): Promise<BackendUser | null> {
	if (!(await nickNameInvalid(nickname))) {
		const user: BackendUser = {
			id: crypto.randomUUID(),
			email: '',
			nickname: nickname,
			forename: '',
			lastname: '',
			password: saltPassword(password),
			created: Date.now()
		};
		await saveUser(user);
		return user;
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
	return !nickname || nickname.length === 0 || (await redis.exists(nickname)) > 0;
}

export function saveUser(user: BackendUser): Promise<string> {
	redis.set(user.nickname, user.id); // damit man von dem Nickname auf den BackendUser schließen kann
	return redis.set(USER + user.id, parseUserToString(user));
}

async function loadUserByNickname(nickname: string): Promise<BackendUser | null> {
	const userId: string | null = await redis.get(nickname);
	if (userId) {
		return loadUserById(userId);
	}
	return null;
}

async function loadUserById(userId: string): Promise<BackendUser | null> {
	const value: string | null = await redis.get(USER + userId);
	if (value) {
		return parseStringToUser(value);
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

function parseUserToString(user: BackendUser): string {
	return JSON.stringify(user);
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
		email: user.email
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

export function createSessionCookie(cookies: Cookies, user: BackendUser) {
	// TODO: nicht den ganzen BackendUser speichern
	cookies.set('session', JSON.stringify(user), {
		path: '/',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 30
	});
}

export async function updateUser(oldUser: BackendUser, formDataPromise: Promise<FormData>): Promise<BackendUser> {
	const formData: UserFormData = await readFormDataFrontEndUser(formDataPromise);
	if (formData.nickname) {
		if (oldUser.nickname !== formData.nickname) {
			if (!(await nickNameInvalid(formData.nickname))) {
				redis.del(oldUser.nickname);
				oldUser.nickname = formData.nickname;
			}
		}
		oldUser.email = formData.email;
		oldUser.forename = formData.forename;
		oldUser.lastname = formData.lastname;
		if (formData.password) {
			oldUser.password = saltPassword(formData.password);
		}
		await saveUser(oldUser);
	}
	return oldUser;
}

export async function saveUserImage(userId: string, image: string): Promise<string> {
	await redis.set(USER_IMG + userId, image);
	return image;
}

export async function getUserImage(userId: string): Promise<string | null> {
	return redis.get(USER_IMG + userId);
}
