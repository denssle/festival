import type { Actions } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { FrontendUser } from '$lib/models/user/FrontendUser';
import { UserService } from '$lib/services/user.service';
import type { PageServerLoad } from './$types';
import { StandardResponse } from '$lib/models/transferData/StandardResponse';
import type { UserFormData } from '$lib/models/user/UserFormData';
import { CurrentUser } from '$lib/models/user/CurrentUser';
import type { UserTransferData } from '$lib/models/user/UserTransferData';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { FriendshipService } from '$lib/services/friendship.service';
import { GroupService } from '$lib/services/group.service';

export const load: PageServerLoad = async ({ locals, params }): Promise<UserTransferData> => {
	const userId: string = params.user_id;
	if (userId) {
		const user: CurrentUser | undefined = locals.currentUser;
		const loaded: FrontendUser | undefined = await UserService.loadFrontEndUserById(userId);
		if (user && loaded) {
			const isOwnProfil: boolean = userId === user.id;
			return {
				user: loaded,
				// E-Mail ist privat und wird nur im eigenen Profil ausgeliefert
				...(isOwnProfil ? { email: await UserService.getEmailById(userId) } : {}),
				isOwnProfil,
				yourFriend: await FriendshipService.areFriends(userId, user.id),
				friendList: await FriendshipService.getFriendList(userId),
				groupList: await GroupService.getGroupsByUserId(userId)
			};
		}
	}
	error(404, 'Not Found');
};

export const actions: Actions = {
	default: async ({ locals, request }): Promise<StandardResponse> => {
		const oldUser: CurrentUser | undefined = locals.currentUser;
		if (oldUser) {
			const formData: UserFormData = await UserService.readFormDataFrontEndUser(request.formData());
			// oldUser.nickname stammt aus der DB (Auth-Hook), nicht aus dem Cookie –
			// die Eindeutigkeitsprüfung ist damit nicht client-seitig umgehbar.
			const nicknameChanged: boolean = oldUser.nickname !== formData.nickname;
			if (nicknameChanged) {
				const invalidNickname: boolean = await UserService.nickNameInvalid(formData.nickname);
				if (invalidNickname) {
					return { success: false, message: 'Nickname invalid!' };
				}
			}
			// E-Mail darf nicht bereits von einem anderen Nutzer belegt sein
			// (die eigene, unveränderte E-Mail bleibt erlaubt).
			if (await UserService.emailTakenByOtherUser(formData.email, oldUser.id)) {
				return { success: false, message: 'Email already in use!' };
			}
			const result: ChangeResult = await UserService.updateUser(oldUser.id, formData);
			if (result === 'Success') {
				// Kein Cookie-Update mehr nötig: Der Auth-Hook lädt den Nickname
				// bei jedem Request frisch aus der DB.
				return { success: true, message: 'Updated user' };
			} else {
				return { success: false, message: result };
			}
		}
		return { success: false, message: 'Update failed!' };
	}
};
