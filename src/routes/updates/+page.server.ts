import type { Cookies } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { UserService } from '$lib/services/user.service';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { UpdateTransferData } from '$lib/models/updates/UpdateTransferData';
import { FriendshipService } from '$lib/services/friendship.service';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<UpdateTransferData> => {
	const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
	if (user) {
		return {
			receivedFriendRequests: await FriendshipService.getReceivedFriendRequests(user.id),
			sentFriendRequests: await FriendshipService.getSentFriendRequests(user.id)
		};
	}
	return {
		receivedFriendRequests: [],
		sentFriendRequests: []
	};
};
