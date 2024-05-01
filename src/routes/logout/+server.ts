import type { RequestHandler } from './$types';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { extractUser, logout } from '$lib/services/user-service';

/* Logout */
export const POST: RequestHandler = async ({ cookies, locals }): Promise<Response> => {
	const user: SessionTokenUser | null = extractUser(cookies.get('session'));
	if (user) {
		await logout(user);
	}
	cookies.delete('session', { path: '/' });
	locals.currentUser = undefined;
	return new Response(null, { status: 303 });
};
