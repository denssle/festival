import type { RequestHandler } from '@sveltejs/kit';
import { GuestInformationService } from '$lib/services/guest-information.service';
import { FestivalEventService } from '$lib/services/festival-event.service';
import { findTooLongField, GUEST_TEXT_LIMITS } from '$lib/services/text-length.logic';
import type { CommentAnswer } from '$lib/models/Answer';
import { t } from '$lib/i18n';

/**
 * Baut den POST-Handler für eine Antwort mit Kommentar auf ein Festival.
 * Genutzt von `/festival/:festival_id/cancel-invitation` ('no') und
 * `/festival/:festival_id/maybe` ('maybe') – beide unterscheiden sich nur im Wert.
 *
 * Body: JSON mit optionalem Kommentar `{ comment?: string }`.
 *
 * @returns 200 bei Erfolg, 401 wenn nicht eingeloggt, 400 bei fehlender festival_id,
 *          404 wenn das Festival nicht existiert, 422 bei zu langem Kommentar
 */
export function answerWithCommentHandler(answer: CommentAnswer): RequestHandler {
	return async ({ locals, params, request }) => {
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
			await GuestInformationService.answerWithComment(currentUser, params.festival_id, answer, comment);
			return new Response(null, { status: 200 });
		}
		return new Response('Bad Request', { status: 400 });
	};
}
