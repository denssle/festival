import { RequestHandler } from '@sveltejs/kit';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { extractUser } from '$lib/services/user.service';
import { acceptFriendRequest } from '$lib/services/friendship.service';

export const POST: RequestHandler = async ({ cookies, request }): Promise<Response> => {
	const user: SessionTokenUser | null = extractUser(cookies.get('session'));
	const body_id = await request.text();
	if (user && body_id) {
		await acceptFriendRequest(user.id, body_id);
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 404 });
};
