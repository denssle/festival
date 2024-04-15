import type { Cookies } from '@sveltejs/kit';
import { PageServerLoad } from '../$types';
import { extractUser, getIncomingFriendRequests, getOutgoingFriendRequests } from '$lib/services/user-service';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { UpdateTransferData } from '$lib/models/updates/UpdateTransferData';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<UpdateTransferData> => {
	const user: SessionTokenUser | null = extractUser(cookies.get('session'));
	if (user) {
		return {
			incoming: await getIncomingFriendRequests(user.id),
			outgoing: await getOutgoingFriendRequests(user.id)
		};
	}
	return {
		incoming: [],
		outgoing: []
	};
};
