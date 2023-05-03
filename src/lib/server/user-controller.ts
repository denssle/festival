import type { User } from '$lib/models/User';
import { compareSync, genSaltSync, hashSync } from 'bcrypt-ts';

const userMap: Map<string, User> = new Map<string, User>();

export function register(email: string, password: string): void {
	console.log('register: ', email, password);
	if (!emailInvalid(email)) {
		userMap.set(email, { email: email, password: hashSync(password) }); // , genSaltSync(24)
	}
}

export function login(email: string, password: string): User | null {
	console.log('login', email, password);
	const user: User | undefined = userMap.get(email);
	if (user && user.password) {
		if (compareSync(password, user.password)) {
			return user;
		}
	}
	return null;
}

export function validateSessionToken(userString: string | undefined): boolean {
	console.log('loginValid', userString);
	if (userString) {
		try {
			const user: User = JSON.parse(userString) as User;
			if (user.email && user.password) {
				const found: User | undefined = userMap.get(user.email);
				return user.password === found?.password;
			}
		} catch (e) {
			console.error(e);
		}
	}
	return false;
}

export function emailInvalid(email: string): boolean {
	return !email || email.length === 0 || userMap.has(email);
}