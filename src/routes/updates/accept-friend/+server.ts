import type { RequestHandler } from './$types';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { UserService } from '$lib/services/user.service';
import { FriendshipService } from '$lib/services/friendship.service';

/**
 * POST /updates/accept-friend
 *
 * Nimmt eine eingehende Freundschaftsanfrage an.
 *
 * @param cookies - Session-Cookie zur Authentifizierung
 * @param request - Body enthält die ID des anfragenden Nutzers als Plaintext
 * @returns 200 bei Erfolg, 401 wenn nicht eingeloggt, 400 bei fehlender Nutzer-ID
 */
export const POST: RequestHandler = async ({ cookies, request }): Promise<Response> => {
	const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
	const body_id = await request.text();
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (body_id) {
		await FriendshipService.acceptFriendRequest(user.id, body_id);
		return new Response(null, { status: 200 });
	}
	return new Response('Bad Request', { status: 400 });
};
