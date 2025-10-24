import type { RequestHandler } from './$types';
import { extractUser, logout } from '$lib/services/user.service';

/* Logout */
export const POST: RequestHandler = async ({ cookies, locals }): Promise<Response> => {
	logout(extractUser(cookies.get('session')), cookies, locals);
	return new Response(null, { status: 303 });
};
