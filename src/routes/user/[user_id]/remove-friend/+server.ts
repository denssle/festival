import type { RequestHandler } from './$types';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { UserService } from '$lib/services/user.service';
import { FriendshipService } from '$lib/services/friendship.service';

/**
 * POST /user/:user_id/remove-friend
 *
 * Entfernt den Nutzer mit der angegebenen ID aus der Freundesliste.
 *
 * @param cookies - Session-Cookie zur Authentifizierung
 * @param params.user_id - ID des Nutzers, der entfernt werden soll
 * @returns 200 bei Erfolg, 401 wenn nicht eingeloggt, 400 bei fehlender Nutzer-ID
 */
export const POST: RequestHandler = async ({ cookies, params }): Promise<Response> => {
	const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
	const params_id: string | undefined = params.user_id;
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (params_id) {
		await FriendshipService.removeFriend(user.id, params_id);
		return new Response(null, { status: 200 });
	}
	return new Response('Bad Request', { status: 400 });
};
