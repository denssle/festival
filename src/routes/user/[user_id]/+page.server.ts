import type { Actions, Cookies } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { FrontendUser } from '$lib/models/user/FrontendUser';
import * as userService from '$lib/services/user-service';
import {
	areFriends,
	createSessionCookie,
	extractUser,
	getFriendList,
	loadFrontEndUserById,
	nickNameInvalid,
	readFormDataFrontEndUser
} from '$lib/services/user-service';
import type { PageServerLoad, RouteParams } from '../../user/[user_id]/$types';
import { StandardResponse } from '$lib/models/StandardResponse';
import type { UserFormData } from '$lib/models/user/UserFormData';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import type { UserTransferData } from '$lib/models/user/UserTransferData';

export const load: PageServerLoad = async ({
	cookies,
	params
}: {
	cookies: Cookies;
	params: RouteParams;
}): Promise<UserTransferData> => {
	const userId: string = params.user_id;
	if (userId) {
		const user: SessionTokenUser | null = extractUser(cookies.get('session'));
		const loaded: FrontendUser | undefined = await loadFrontEndUserById(userId);
		if (user && loaded) {
			return {
				user: loaded,
				isOwnProfil: user && userId === user.id,
				yourFriend: await areFriends(userId, user.id),
				friendList: await getFriendList(userId)
			};
		}
	}
	error(404, 'Not Found');
};

export const actions: Actions = {
	default: async ({ cookies, request }): Promise<StandardResponse> => {
		const oldUser: SessionTokenUser | null = userService.extractUser(cookies.get('session'));
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
