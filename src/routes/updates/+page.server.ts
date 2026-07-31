import type { PageServerLoad } from './$types';
import { UpdateTransferData } from '$lib/models/updates/UpdateTransferData';
import { FriendshipService } from '$lib/services/friendship.service';

export const load: PageServerLoad = async ({ locals }): Promise<UpdateTransferData> => {
	const user = locals.currentUser;
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
