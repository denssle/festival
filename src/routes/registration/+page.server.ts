import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import { emailInvalid, register, validateSessionToken } from '$lib/services/user-service';

export const load = (async ({ cookies, locals, request }) => {
	const valid = await validateSessionToken(cookies.get('session'));
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
			if (emailInvalid(email)) {
				return fail(409, { success: false, errorMessage: 'Email already existing' });
			} else {
				const password: string = String(passwordValue);
				register(email, password);
				throw redirect(303, '/login');
			}
		}
		return { success: false, errorMessage: 'Password and / or Email missing' };
	}
} satisfies Actions;
