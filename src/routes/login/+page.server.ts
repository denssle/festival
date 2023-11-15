import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import { login, validateSessionToken } from '$lib/services/user-service';
import type { BackendUser } from '$lib/models/BackendUser';

export const load = (async ({ cookies, request, locals }) => {
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
		const values: FormData = await request.formData();
		const emailValue: FormDataEntryValue | null = values.get('email');
		const passwordValue: FormDataEntryValue | null = values.get('password');
		if (emailValue && passwordValue) {
			const user: BackendUser | null = await login(emailValue.toString(), passwordValue.toString());
			if (user) {
				// TODO: nicht den ganzen BackendUser speichern
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
