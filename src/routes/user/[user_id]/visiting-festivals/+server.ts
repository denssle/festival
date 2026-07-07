import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { FestivalEventService } from '$lib/services/festival-event.service';
import { VisitingFestival } from '$lib/models/user/VisitingFestival';
import { UserService } from '$lib/services/user.service';
import { FriendshipService } from '$lib/services/friendship.service';

/**
 * GET /user/:user_id/visiting-festivals
 *
 * Gibt alle Festivals zurück, die der angegebene Nutzer besuchen wird.
 * Nur der Nutzer selbst oder befreundete Nutzer dürfen diese Liste abrufen.
 *
 * @param request - RequestEvent mit user_id in params und session-Cookie
 * @returns 200 mit JSON-Array von VisitingFestival bei Erfolg,
 *          401 wenn nicht eingeloggt,
 *          403 wenn nicht befreundet und nicht der eigene Account,
 *          400 bei fehlender user_id
 */
export const GET: RequestHandler = async ({ params, cookies }): Promise<Response> => {
	const pathId: string | undefined = params.user_id;
	const user = UserService.extractUser(cookies.get('session'));

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	if (pathId) {
		// Nur wenn man selbst der User ist oder befreundet ist
		const isOwn = user.id === pathId;
		const isFriend = await FriendshipService.areFriends(user.id, pathId);

		if (isOwn || isFriend) {
			const visitingFestivals: VisitingFestival[] = await FestivalEventService.getFestivalYouVisit(pathId);
			return new Response(JSON.stringify(visitingFestivals), { status: 200 });
		} else {
			throw error(403, 'Forbidden');
		}
	}
	return new Response(null, { status: 400 });
};
