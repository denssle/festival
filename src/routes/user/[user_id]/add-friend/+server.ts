import type { RequestHandler } from './$types';
import { addFriend, extractUser, getFriends } from '$lib/services/user-service';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';

export const POST: RequestHandler = async ({ cookies, params }): Promise<Response> => {
	const user: SessionTokenUser | null = extractUser(cookies.get('session'));
	const params_id: string = params.user_id;
	if (user && params_id) {
		await addFriend(user.id, params_id);
		console.log(await getFriends(user.id));
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 404 });
};
