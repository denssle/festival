import * as userController from '$lib/server/user-service';
import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';

export const load = (async ({ cookies, locals, request }) => {
	const valid = await userController.validateSessionToken(cookies.get('session'));
	if (valid) {
		throw redirect(303, '/');
	}
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
		if (emailValue && passwordValue) {
			const email = String(emailValue);
			if (userController.emailInvalid(email)) {
				return fail(409, { success: false, errorMessage: 'Email already existing' });
			} else {
				const password = String(passwordValue);
				userController.register(email, password);
				throw redirect(303, '/login');
			}
		}
		return { success: false, errorMessage: 'Password and / or Email missing' };
	}
} satisfies Actions;
