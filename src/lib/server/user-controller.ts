import type { User } from '$lib/models/User';
import { saveUser } from '../database';
import { compareSync, hashSync } from 'bcrypt-ts';

const userMap: Map<string, User> = new Map<string, User>();

export function register(email: string, password: string): void {
	console.log('register: ', email, password);
	if (!emailInvalid(email)) {
		userMap.set(email, { email: email, password: hashSync(password) }); // , genSaltSync(24)
		saveUser(email, password);
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
	console.log('session validation: userString: ', userString);
	if (userString) {
		try {
			const user: User = JSON.parse(userString) as User;
			if (user.email && user.password) {
				const found: User | undefined = userMap.get(user.email);
				if (found && found.password) {
					console.log('session validation: compare', found.password === user.password);
					return found.password === user.password;
				} else {
					console.log('session validation: no user in db found', found);
				}
			} else {
				console.log('session validation: token user invalid', user);
			}
		} catch (e) {
			console.error('session validation error', e);
		}
	}
	return false;
}

export function emailInvalid(email: string): boolean {
	return !email || email.length === 0; // || userMap.has(email);
}