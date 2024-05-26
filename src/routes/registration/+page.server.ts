import type { Actions, Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import * as userService from '$lib/services/user.service';
import { nickNameInvalid, register, validateSessionToken } from '$lib/services/user.service';
import { StandardResponse } from '$lib/models/StandardResponse';
import { BackendUser } from '$lib/models/user/BackendUser';
import { NickPassData } from '$lib/models/user/NickPassData';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<StandardResponse> => {
	const valid: boolean = await validateSessionToken(cookies.get('session'));
	if (valid) {
		redirect(303, '/');
	}
	return { success: true };
};

export const actions: Actions = {
	default: async ({ cookies, request }: { cookies: Cookies; request: Request }): Promise<StandardResponse> => {
		const formData: NickPassData | undefined = await userService.readNickPass(request.formData());
		if (formData) {
			if (await nickNameInvalid(formData.nickname)) {
				return { success: false, message: 'Invalid Nickname' };
			} else {
				const user: BackendUser | null = await register(formData.nickname, formData.password);
				if (user) {
					await userService.createSessionCookie(cookies, user);
					redirect(302, '/');
				} else {
					return { success: false, message: 'User creation failed' };
				}
			}
		}
		return { success: false, message: 'Password and / or Nickname missing' };
	}
};
