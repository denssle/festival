import type { Actions, Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import { UserService } from '$lib/services/user.service';
import type { BackendUser } from '$lib/models/user/BackendUser';
import { StandardResponse } from '$lib/models/transferData/StandardResponse';
import { NickPassData } from '$lib/models/transferData/NickPassData';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<StandardResponse> => {
	const valid: boolean = await UserService.validateSessionToken(cookies.get('session'));
	if (valid) {
		redirect(303, '/');
	}
	return { success: true };
};

export const actions: Actions = {
	default: async ({
		cookies,
		request,
		locals
	}: {
		cookies: Cookies;
		request: Request;
		locals: App.Locals;
	}): Promise<StandardResponse> => {
		const formData: NickPassData | undefined = await UserService.readNickPass(request.formData());
		if (formData) {
			const user: BackendUser | null = await UserService.loginWithCredentials(formData.nickname, formData.password);
			if (user) {
				await UserService.createSessionCookie(cookies, locals, user);
				redirect(302, '/');
			} else {
				return { success: false, message: 'Password invalid' };
			}
		}
		return { success: false, message: 'Password and / or Nickname missing' };
	}
};
