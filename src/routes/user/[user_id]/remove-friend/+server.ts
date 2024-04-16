import { RequestHandler } from '@sveltejs/kit';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { extractUser, removeFriend } from '$lib/services/user-service';

export const POST: RequestHandler = async ({ cookies, params }): Promise<Response> => {
	const user: SessionTokenUser | null = extractUser(cookies.get('session'));
	const params_id: string | undefined = params.user_id;
	if (user && params_id) {
		await removeFriend(user.id, params_id);
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 404 });
};
