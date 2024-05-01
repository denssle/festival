import type { Cookies } from '@sveltejs/kit';
import { PageServerLoad } from '../$types';
import { extractUser } from '$lib/services/user-service';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { UpdateTransferData } from '$lib/models/updates/UpdateTransferData';
import { getReceivedFriendRequests, getSentFriendRequests } from '$lib/services/friendship-service';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<UpdateTransferData> => {
	const user: SessionTokenUser | null = extractUser(cookies.get('session'));
	if (user) {
		return {
			receivedFriendRequests: await getReceivedFriendRequests(user.id),
			sentFriendRequests: await getSentFriendRequests(user.id)
		};
	}
	return {
		receivedFriendRequests: [],
		sentFriendRequests: []
	};
};
