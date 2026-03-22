import type { Actions, Cookies } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { FrontendUser } from '$lib/models/user/FrontendUser';
import { UserService } from '$lib/services/user.service';
import type { PageServerLoad, RouteParams } from '../../user/[user_id]/$types';
import { StandardResponse } from '$lib/models/transferData/StandardResponse';
import type { UserFormData } from '$lib/models/user/UserFormData';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import type { UserTransferData } from '$lib/models/user/UserTransferData';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { FriendshipService } from '$lib/services/friendship.service';
import { GroupService } from '$lib/services/group.service';

export const load: PageServerLoad = async ({
	cookies,
	params
}: {
	cookies: Cookies;
	params: RouteParams;
}): Promise<UserTransferData> => {
	const userId: string = params.user_id;
	if (userId) {
		const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
		const loaded: FrontendUser | undefined = await UserService.loadFrontEndUserById(userId);
		if (user && loaded) {
			return {
				user: loaded,
				isOwnProfil: user && userId === user.id,
				yourFriend: await FriendshipService.areFriends(userId, user.id),
				friendList: await FriendshipService.getFriendList(userId),
				groupList: await GroupService.getGroupsByUserId(userId)
			};
		}
	}
	error(404, 'Not Found');
};

export const actions: Actions = {
	default: async ({ cookies, request }): Promise<StandardResponse> => {
		const oldUser: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
		if (oldUser) {
			const formData: UserFormData = await UserService.readFormDataFrontEndUser(request.formData());
			if (oldUser.nickname !== formData.nickname) {
				const invalidNickname: boolean = await UserService.nickNameInvalid(formData.nickname);
				console.log('invalid nick', invalidNickname);
				if (invalidNickname) {
					return { success: false, message: 'Nickname invalid!' };
				}
			}
			const result: ChangeResult = await UserService.updateUser(oldUser, formData);
			if (result === 'Success') {
				return { success: true, message: 'Updated user' };
			} else {
				return { success: false, message: result };
			}
		}
		return { success: false, message: 'Update failed!' };
	}
};
