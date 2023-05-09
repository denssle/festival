import * as userController from '$lib/server/user-controller';
import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { User } from '$lib/models/User';
import type { PageServerLoad } from '../../.svelte-kit/types/src/routes/$types';

export const load = (({ cookies, request }) => {
	console.log('login cookies: ', cookies.get('session'));
	if (userController.validateSessionToken(cookies.get('session'))) {
		console.log('login session token valid');
		return {
			success: true,
			authorized: true
		};
	}
	console.log('login session token invalid');
	return {
		success: true,
		authorized: false
	};
}) satisfies PageServerLoad;


export const actions = {
	default: async ({ cookies, request }) => {
		const values = await request.formData();
		const emailValue = values.get('email');
		const passwordValue = values.get('password');
		console.log('login default action: ', emailValue, passwordValue);
		if (emailValue && passwordValue) {
			const email = String(emailValue);
			const password = String(passwordValue);
			const user: User | null = userController.login(email, password);
			if (user) {
				cookies.set('session', JSON.stringify(user), {
					path: '/',
					sameSite: 'strict',
					maxAge: 60 * 60 * 24 * 30
				});
				throw redirect(302, '/');
			}
		}
		return { success: false, authorized: false, errorMessage: 'Password and / or Email missing' };
	}
} satisfies Actions;