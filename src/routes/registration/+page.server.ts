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
	return {
		success: true,
		authorized: false
	};
};

export const actions: Actions = {
	default: async ({ request }): Promise<StandardResponse> => {
		const formData: UserFormData = await userService.readFormDataFrontEndUser(request.formData());
		if (formData.nickname && formData.password) {
			if (await nickNameInvalid(formData.nickname)) {
				return { success: false, authorized: false, message: 'Invalid Nickname' };
			} else {
				register(formData.nickname, formData.password);
				throw redirect(303, '/login');
			}
		}
		return { success: false, authorized: true, message: 'Password and / or Nickname missing' };
	}
};
