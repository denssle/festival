import type { RequestHandler } from './$types';
import { UserService } from '$lib/services/user.service';

/* Logout */
export const POST: RequestHandler = async ({ cookies, locals }): Promise<Response> => {
	await UserService.logout(UserService.extractUser(cookies.get('session')), cookies, locals);
	return new Response(null, { status: 303 });
};
