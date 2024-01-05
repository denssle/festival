import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import type { Actions, Cookies } from '@sveltejs/kit';
import type { BackendUser } from '$lib/models/BackendUser';
import * as userService from '$lib/services/user-service';
import { createSessionCookie } from '$lib/services/user-service';
import type { FrontendUser } from '$lib/models/FrontendUser';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<FrontendUser | null> => {
	const extractUser: BackendUser | null = userService.extractUser(cookies.get('session'));
	if (extractUser) {
		return userService.parseToFrontEnd(extractUser);
	}
	return null;
};

export const actions: Actions = {
	default: async ({ cookies, request }): Promise<Response> => {
		const oldUser: BackendUser | null = userService.extractUser(cookies.get('session'));
		if (oldUser) {
			createSessionCookie(cookies, await userService.updateUser(oldUser, request.formData()));
		}
		return new Response(null, { status: 500 });
	}
};
