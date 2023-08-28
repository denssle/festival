import type { User } from '$lib/models/User';
import { compareSync, hashSync } from 'bcrypt-ts';
import redis from '$lib/redis';

export function register(email: string, password: string): void {
	if (!emailInvalid(email)) {
		const user: User = { id: `user:${crypto.randomUUID()}`, email: email, password: hashSync(password) }; // , genSaltSync(7)
		saveUser(user);
	}
}

export async function login(email: string, password: string): Promise<User | null> {
	const user: User | null = await loadUser(email);
	if (user && user.password) {
		if (compareSync(password, user.password)) {
			return user;
		}
	}
	return null;
}

export async function validateSessionToken(userString: string | undefined): Promise<boolean> {
	// TODO Check token age
	const user: User | null = extractUser(userString);
	if (user) {
		const found: User | null = await loadUser(user.email);
		if (found && found.password) {
			return found.password === user.password;
		} else {
			console.error('session validation: no user in db found', found);
		}
	}
	return false;
}

export function extractUser(sessionToken: string | undefined) {
	if (sessionToken) {
		try {
			const maybeUser: User = JSON.parse(sessionToken) as User;
			if (maybeUser.password && maybeUser.email) {
				return maybeUser;
			}
		} catch (e) {
			console.error('error parsing session token', e);
		}
	}
	return null;
}

export function emailInvalid(email: string): boolean {
	return !email || email.length === 0; // || userMap.has(email);
}

function saveUser(user: User): Promise<string> {
	// TODO switch to user: + user id as primary key
	return redis.set(user.email, JSON.stringify(user));
}

function loadUser(email: string): Promise<User | null> {
	return redis.get(email).then((value) => {
		if (value) {
			return JSON.parse(value) as User;
		}
		return null;
	});
}
