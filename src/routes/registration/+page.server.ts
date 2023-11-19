import type { Actions, Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import { nickNameInvalid, register, validateSessionToken } from '$lib/services/user-service';
import type { StandardResponse } from '$lib/models/StandardResponse';
import type { UserFormData } from '$lib/models/UserFormData';
import * as userService from '$lib/services/user-service';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<StandardResponse> => {
	const valid: boolean = await validateSessionToken(cookies.get('session'));
	if (valid) {
		throw redirect(303, '/');
	}
	return { success: true };
};

export const actions: Actions = {
	default: async ({ cookies, request }): Promise<StandardResponse> => {
		const formData: UserFormData = await userService.readFormDataFrontEndUser(request.formData());
		if (formData.nickname && formData.password) {
			if (await nickNameInvalid(formData.nickname)) {
				return { success: false, message: 'Invalid Nickname' };
			} else {
				const user = await register(formData.nickname, formData.password);
				if (user) {
					userService.createSessionCookie(cookies, user);
					throw redirect(302, '/');
				}
			}
		}
		return { success: false, message: 'Password and / or Nickname missing' };
	}
};
