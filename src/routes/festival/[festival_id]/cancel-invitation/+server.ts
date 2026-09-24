import type { RequestHandler } from '@sveltejs/kit';
import { GuestInformationService } from '$lib/services/guest-information.service';
import { FestivalEventService } from '$lib/services/festival-event.service';
import { findTooLongField, GUEST_TEXT_LIMITS } from '$lib/services/text-length.logic';
import { t } from '$lib/i18n';

/**
 * POST /festival/:festival_id/cancel-invitation
 *
 * Storniert die Einladung eines Nutzers zu einem Festival.
 * Der optionale Kommentar im Request-Body wird als Begründung gespeichert.
 *
 * @param cookies - Session-Cookie zur Authentifizierung
 * @param params.festival_id - ID des Festivals
 * @param request - Body enthält als JSON einen optionalen Kommentar: { comment?: string }
 * @returns 200 bei Erfolg, 401 wenn nicht eingeloggt, 400 bei fehlender festival_id,
 *          422 bei zu langem Kommentar
 */
export const POST: RequestHandler = async ({ locals, params, request }) => {
	const currentUser = locals.currentUser ?? null;
	if (!currentUser) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { comment = '' }: { comment?: string } = await request.json();
	const tooLong = findTooLongField({ comment }, GUEST_TEXT_LIMITS);
	if (tooLong) {
		return new Response(t(locals.locale, 'error.inputTooLong', { max: tooLong.max }), { status: 422 });
	}

	if (params.festival_id) {
		const festival = await FestivalEventService.getFrontEndFestival(params.festival_id);
		if (!festival) {
			return new Response('Festival not found', { status: 404 });
		}
		await GuestInformationService.cancelInvitation(currentUser, params.festival_id, comment);
		return new Response(null, { status: 200 });
	}
	return new Response('Bad Request', { status: 400 });
};
