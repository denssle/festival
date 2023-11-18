import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import type { Actions, Cookies } from '@sveltejs/kit';
import type { BackendUser } from '$lib/models/BackendUser';
import * as userService from '$lib/services/user-service';
import type { StandardResponse } from '$lib/models/StandardResponse';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<BackendUser | null> => {
	return userService.extractUser(cookies.get('session'));
};

export const actions: Actions = {
	default: async ({ cookies, request }): Promise<StandardResponse> => {
		const oldUser: BackendUser | null = userService.extractUser(cookies.get('session'));
		if (oldUser) {
			const values: FormData = await request.formData();
			const emailValue: FormDataEntryValue | null = values.get('email');
			const passwordValue: FormDataEntryValue | null = values.get('password');
			if (emailValue && passwordValue) {
				const nicknameValue: FormDataEntryValue | null = values.get('nickname');
				oldUser.email = String(emailValue);
				oldUser.nickname = String(nicknameValue);
				oldUser.password = String(passwordValue);
				await userService.saveUser(oldUser);
				return { success: true, authorized: true };
			}
		}
		return { success: false, authorized: true, message: 'Password and / or Email missing' };
	}
};
