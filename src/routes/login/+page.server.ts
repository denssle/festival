import type { Actions, Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import * as userService from '$lib/services/user-service';
import { login, validateSessionToken } from '$lib/services/user-service';
import type { BackendUser } from '$lib/models/BackendUser';
import type { UserFormData } from '$lib/models/UserFormData';
import { StandardResponse } from '$lib/models/StandardResponse';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<StandardResponse> => {
	const valid: boolean = await validateSessionToken(cookies.get('session'));
	console.log('LOGIN valid', valid);
	if (valid) {
		redirect(303, '/');
	}
	return { success: true };
};

export const actions: Actions = {
	default: async ({ cookies, request }: { cookies: Cookies; request: Request }): Promise<StandardResponse> => {
		const formData: UserFormData = await userService.readFormDataFrontEndUser(request.formData());
		if (formData.nickname && formData.password) {
			const user: BackendUser | null = await login(formData.nickname, formData.password);
			console.log(user, formData.nickname, formData.password);
			if (user) {
				userService.createSessionCookie(cookies, user);
				redirect(302, '/');
			}
		}
		return { success: false, message: 'Password and / or Nickname missing' };
	}
};
