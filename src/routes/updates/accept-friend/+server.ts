import type { RequestHandler } from './$types';
import { errorResponse } from '$lib/controller/error-response';
import { CurrentUser } from '$lib/models/user/CurrentUser';
import { FriendshipService } from '$lib/services/friendship.service';

/**
 * POST /updates/accept-friend
 *
 * Nimmt eine eingehende Freundschaftsanfrage an.
 *
 * @param locals - enthält den vom Auth-Hook geladenen currentUser
 * @param request - Body enthält die ID des anfragenden Nutzers als Plaintext
 * @returns 200 bei Erfolg, 401 wenn nicht eingeloggt, 400 bei fehlender Nutzer-ID
 */
export const POST: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const user: CurrentUser | undefined = locals.currentUser;
	const body_id = await request.text();
	if (!user) {
		return errorResponse(locals.locale, 401, 'error.notAuthenticated');
	}
	if (body_id) {
		await FriendshipService.acceptFriendRequest(user.id, body_id);
		return new Response(null, { status: 200 });
	}
	return errorResponse(locals.locale, 400, 'error.missingData');
};
