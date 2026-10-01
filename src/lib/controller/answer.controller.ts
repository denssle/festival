import type { RequestHandler } from '@sveltejs/kit';
import { errorResponse } from '$lib/controller/error-response';
import { GuestInformationService } from '$lib/services/guest-information.service';
import { FestivalEventService } from '$lib/services/festival-event.service';
import { findTooLongField, GUEST_TEXT_LIMITS } from '$lib/services/text-length.logic';
import type { CommentAnswer } from '$lib/models/Answer';

/**
 * Baut den POST-Handler für eine Antwort mit Kommentar auf ein Festival.
 * Genutzt von `/festival/:festival_id/cancel-invitation` ('no') und
 * `/festival/:festival_id/maybe` ('maybe') – beide unterscheiden sich nur im Wert.
 *
 * Body: JSON mit optionalem Kommentar `{ comment?: string }`.
 *
 * @returns 200 bei Erfolg, 401 wenn nicht eingeloggt, 400 bei fehlender festival_id,
 *          404 wenn das Festival nicht existiert oder für den Nutzer nicht sichtbar ist, 422 bei zu langem Kommentar
 */
export function answerWithCommentHandler(answer: CommentAnswer): RequestHandler {
	return async ({ locals, params, request }) => {
		const currentUser = locals.currentUser ?? null;
		if (!currentUser) {
			return errorResponse(locals.locale, 401, 'error.notAuthenticated');
		}

		const { comment = '' }: { comment?: string } = await request.json();
		const tooLong = findTooLongField({ comment }, GUEST_TEXT_LIMITS);
		if (tooLong) {
			return errorResponse(locals.locale, 422, 'error.inputTooLong', { max: tooLong.max });
		}

		if (params.festival_id) {
			if (!(await FestivalEventService.isVisibleTo(currentUser.id, params.festival_id))) {
				return errorResponse(locals.locale, 404, 'festival.error.notFound');
			}
			await GuestInformationService.answerWithComment(currentUser, params.festival_id, answer, comment);
			return new Response(null, { status: 200 });
		}
		return errorResponse(locals.locale, 400, 'error.missingData');
	};
}
