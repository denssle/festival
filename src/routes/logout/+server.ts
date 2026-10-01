import type { RequestHandler } from './$types';
import { UserService } from '$lib/services/user.service';

/**
 * POST /logout
 *
 * Meldet den eingeloggten Nutzer ab und löscht den Session-Cookie.
 *
 * @param cookies - Session-Cookie, der nach dem Logout gelöscht wird
 * @param locals - SvelteKit-Locals, in denen die Session zurückgesetzt wird
 * @returns 204 – die Weiterleitung zu /login übernimmt das Layout
 */
export const POST: RequestHandler = async ({ cookies, locals }): Promise<Response> => {
	await UserService.logout(cookies, locals);
	// 204 statt des früheren 303: Ein 303 ohne Location-Header ist keine Umleitung, und
	// `request()` wertet ihn (zu Recht) als Fehler. Wohin es danach geht, entscheidet das
	// Layout selbst (goto('/login')).
	return new Response(null, { status: 204 });
};
