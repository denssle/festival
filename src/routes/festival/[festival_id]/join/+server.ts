import { FestivalEventService } from '$lib/services/festival-event.service';
import type { RequestHandler } from '@sveltejs/kit';
import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';
import { GuestInformationService } from '$lib/services/guest-information.service';
import { errorResponse } from '$lib/controller/error-response';
import { findTooLongField, GUEST_TEXT_LIMITS } from '$lib/services/text-length.logic';

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
 *          404 wenn Festival nicht gefunden oder für den Nutzer nicht sichtbar,
 *          400 bei fehlenden Daten,
 *          422 bei zu langen Angaben,
 *          500 bei internem Fehler
 */
export const POST: RequestHandler = async ({ locals, params, request }): Promise<Response> => {
	try {
		const baseGuestInformation: BaseGuestInformation = await request.json();
		baseGuestInformation.answer = 'yes';
		const user = locals.currentUser ?? null;

		if (!user) {
			return errorResponse(locals.locale, 401, 'error.notAuthenticated');
		}

		if (params.festival_id && baseGuestInformation) {
			const tooLong = findTooLongField(
				{
					food: baseGuestInformation.food,
					drink: baseGuestInformation.drink,
					comment: baseGuestInformation.comment
				},
				GUEST_TEXT_LIMITS
			);
			if (tooLong) {
				return errorResponse(locals.locale, 422, 'error.inputTooLong', { max: tooLong.max });
			}
			if (!(await FestivalEventService.isVisibleTo(user.id, params.festival_id))) {
				return errorResponse(locals.locale, 404, 'festival.error.notFound');
			}
			await GuestInformationService.joinFestival(user, params.festival_id, baseGuestInformation);
			return new Response(JSON.stringify({ success: true }), { status: 200 });
		}
		console.warn('join festival: missing data', {
			festival_id: params.festival_id,
			user: !!user,
			parsed: !!baseGuestInformation
		});
		return errorResponse(locals.locale, 400, 'error.missingData');
	} catch (e) {
		console.error('Error joining festival:', e);
		return errorResponse(locals.locale, 500, 'error.internal');
	}
};
