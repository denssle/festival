import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import type { Actions, Cookies } from '@sveltejs/kit';
import type { BackendUser } from '$lib/models/user/BackendUser';
import * as userService from '$lib/services/user-service';
import { createSessionCookie, nickNameInvalid, readFormDataFrontEndUser } from '$lib/services/user-service';
import type { FrontendUser } from '$lib/models/user/FrontendUser';
import type { UserFormData } from '$lib/models/user/UserFormData';
import { StandardResponse } from '$lib/models/StandardResponse';

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
			const formData: UserFormData = await readFormDataFrontEndUser(request.formData());
			if (oldUser.nickname !== formData.nickname) {
				const invalidNickname: boolean = await nickNameInvalid(formData.nickname);
				console.log('invalid nick', invalidNickname);
				if (invalidNickname) {
					return { success: false, message: 'Nickname invalid!' };
				}
			}
			createSessionCookie(cookies, await userService.updateUser(oldUser, formData));
			return { success: true, message: 'Updated user' };
		}
		return { success: false, message: 'Update failed!' };
	}
};
