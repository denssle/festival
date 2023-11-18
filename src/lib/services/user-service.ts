import { compareSync, genSaltSync, hashSync } from 'bcrypt-ts';
import type { BackendUser } from '../models/BackendUser';
import redis from '../redis';
import type { FrontendUser } from '../models/FrontendUser';
import type { UserFormData } from '$lib/models/UserFormData';
import type { Cookies } from '@sveltejs/kit';

export function register(email: string, password: string): Promise<string> | null {
	if (!emailInvalid(email)) {
		const user: BackendUser = {
			id: crypto.randomUUID(),
			email: email,
			nickname: '',
			password: saltPassword(password)
		};
		return saveUser(user);
	}
	return null;
}

export function saltPassword(password: string): string {
	return hashSync(password, genSaltSync(4));
}

export async function login(email: string, password: string): Promise<BackendUser | null> {
	const user: BackendUser | null = await loadUserByEmail(email);
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

export function emailInvalid(email: string): boolean {
	// TODO Check if email is already existing
	return !email || email.length === 0; // || userMap.has(email);
}

export function saveUser(user: BackendUser): Promise<string> {
	redis.set(user.email, user.id); // damit man von der Email auf den BackendUser schließen kann
	return redis.set('user:' + user.id, parseUserToString(user));
}

async function loadUserByEmail(email: string): Promise<BackendUser | null> {
	const userId: string | null = await redis.get(email);
	if (userId) {
		return loadUserById(userId);
	}
	return null;
}

async function loadUserById(userId: string): Promise<BackendUser | null> {
	const value: string | null = await redis.get('user:' + userId);
	if (value) {
		return parseStringToUser(value);
	}
	return null;
}

export async function loadFrontEndUserById(id: string | null): Promise<FrontendUser | undefined> {
	if (id) {
		const byId = await loadUserById(id);
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
		if (maybeUser.password && maybeUser.email) {
			return maybeUser;
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
		email: user.email
	};
}

export async function readFormDataFrontEndUser(data: Promise<FormData>): Promise<UserFormData> {
	const values: FormData = await data;
	return {
		email: String(values.get('email')),
		nickname: String(values.get('nickname')),
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
	if (formData.email) {
		if (oldUser.email !== formData.email) {
			redis.del(oldUser.email);
			oldUser.email = formData.email;
		}
		oldUser.nickname = formData.nickname;
		if (formData.password) {
			oldUser.password = saltPassword(formData.password);
		}
		await saveUser(oldUser);
	}
	return oldUser;
}
