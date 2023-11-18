import type { Actions, Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import { emailInvalid, register, validateSessionToken } from '$lib/services/user-service';
import type { StandardResponse } from '$lib/models/StandardResponse';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<StandardResponse> => {
	const valid = await validateSessionToken(cookies.get('session'));
	if (valid) {
		throw redirect(303, '/');
	}
	return {
		success: true,
		authorized: false
	};
};

export const actions: Actions = {
	default: async ({ request }): Promise<StandardResponse> => {
		const values = await request.formData();
		const emailValue = values.get('email');
		const passwordValue = values.get('password');
		if (emailValue && passwordValue) {
			const email = String(emailValue);
			if (emailInvalid(email)) {
				return { success: false, authorized: true, message: 'Email already existing' };
			} else {
				const password: string = String(passwordValue);
				register(email, password);
				throw redirect(303, '/login');
			}
		}
		return { success: false, authorized: true, message: 'Password and / or Email missing' };
	}
};
