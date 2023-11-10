import { compareSync, genSaltSync, hashSync } from 'bcrypt-ts';
import type { BackendUser } from '../models/BackendUser';
import redis from '../redis';
import type { FrontendUser } from '../models/FrontendUser';

export function register(email: string, password: string): Promise<string> | null {
	if (!emailInvalid(email)) {
		const user: BackendUser = { id: crypto.randomUUID(), email: email, password: hashSync(password, genSaltSync(4)) };
		return saveUser(user);
	}
	return null;
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
	return !email || email.length === 0; // || userMap.has(email);
}

function saveUser(user: BackendUser): Promise<string> {
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

function parseToFrontEnd(user: BackendUser): FrontendUser {
	return {
		id: user.id,
		email: user.email
	};
}
