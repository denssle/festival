import type { RequestHandler } from './$types';
import { UserService } from '$lib/services/user.service';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { FriendshipService } from '$lib/services/friendship.service';

export const POST: RequestHandler = async ({ cookies, params }): Promise<Response> => {
	const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
	const params_id: string = params.user_id;
	if (user && params_id) {
		await FriendshipService.createFriendRequest(user.id, params_id);
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 404 });
};
