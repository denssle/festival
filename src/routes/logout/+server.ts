import type { RequestHandler } from './$types';
import { UserService } from '$lib/services/user.service';

/**
 * POST /logout
 *
 * Meldet den eingeloggten Nutzer ab und löscht den Session-Cookie.
 *
 * @param cookies - Session-Cookie, der nach dem Logout gelöscht wird
 * @param locals - SvelteKit-Locals, in denen die Session zurückgesetzt wird
 * @returns 303 Redirect zur Startseite
 */
export const POST: RequestHandler = async ({ cookies, locals }): Promise<Response> => {
	await UserService.logout(UserService.extractUser(cookies.get('session')), cookies, locals);
	return new Response(null, { status: 303 });
};
