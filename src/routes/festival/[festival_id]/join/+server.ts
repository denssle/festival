import { FestivalEventService } from '$lib/services/festival-event.service';
import type { RequestHandler } from '@sveltejs/kit';
import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';
import { GuestInformationService } from '$lib/services/guest-information.service';
import { UserService } from '$lib/services/user.service';

/**
 * POST /festival/:festival_id/join
 *
 * Meldet den eingeloggten Nutzer für ein Festival an.
 * Erwartet ein BaseGuestInformation-Objekt als JSON im Request-Body.
 *
 * @param cookies - Session-Cookie zur Authentifizierung
 * @param params.festival_id - ID des Festivals
 * @param request - Body enthält BaseGuestInformation als JSON (z. B. Essensvorlieben)
 * @returns 200 mit { success: true } bei Erfolg,
 *          401 wenn nicht eingeloggt,
 *          404 wenn Festival nicht gefunden,
 *          400 bei fehlenden Daten,
 *          500 bei internem Fehler
 */
export const POST: RequestHandler = async ({ cookies, params, request }): Promise<Response> => {
	try {
		const baseGuestInformation: BaseGuestInformation = await request.json();
		baseGuestInformation.coming = true;
		const user = UserService.extractUser(cookies.get('session'));

		if (!user) {
			return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
		}

		if (params.festival_id && baseGuestInformation) {
			const festival = await FestivalEventService.getFrontEndFestival(params.festival_id);
			if (!festival) {
				return new Response(JSON.stringify({ success: false, message: 'Festival not found' }), { status: 404 });
			}
			await GuestInformationService.joinFestival(user, params.festival_id, baseGuestInformation);
			return new Response(JSON.stringify({ success: true }), { status: 200 });
		}
		console.warn('join festival: missing data', {
			festival_id: params.festival_id,
			user: !!user,
			parsed: !!baseGuestInformation
		});
		return new Response(JSON.stringify({ success: false, message: 'Missing data' }), { status: 400 });
	} catch (e) {
		console.error('Error joining festival:', e);
		return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 });
	}
};
