import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import type { Actions, Cookies } from '@sveltejs/kit';
import type { BackendUser } from '$lib/models/BackendUser';
import * as userService from '$lib/services/user-service';
import type { StandardResponse } from '$lib/models/StandardResponse';
import type { FrontendUser } from '$lib/models/FrontendUser';
import { createSessionCookie } from '$lib/services/user-service';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<FrontendUser | null> => {
	const extractUser: BackendUser | null = userService.extractUser(cookies.get('session'));
	if (extractUser) {
		return userService.parseToFrontEnd(extractUser);
	}
	return null;
};

export const actions: Actions = {
	default: async ({ cookies, request }): Promise<StandardResponse> => {
		const oldUser: BackendUser | null = userService.extractUser(cookies.get('session'));
		if (oldUser) {
			createSessionCookie(cookies, await userService.updateUser(oldUser, request.formData()));
		}
		return { success: false, message: 'User update failed' };
	}
};
