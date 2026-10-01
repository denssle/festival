import { FestivalEventService } from '$lib/services/festival-event.service';
import type { RequestHandler } from '@sveltejs/kit';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { changeResultResponse, errorResponse } from '$lib/controller/error-response';

/**
 * DELETE /festival/:festival_id
 *
 * Löscht ein Festival anhand seiner ID.
 * Nur der Ersteller des Festivals ist dazu berechtigt.
 *
 * @param cookies - Session-Cookie zur Authentifizierung
 * @param params.festival_id - ID des zu löschenden Festivals
 * @returns 200 bei Erfolg, 403 bei fehlender Berechtigung, 400 bei ungültiger Anfrage
 */
export const DELETE: RequestHandler = async ({ locals, params }): Promise<Response> => {
	if (params && params.festival_id) {
		const result: ChangeResult = await FestivalEventService.deleteFestival(
			locals.currentUser ?? null,
			params.festival_id
		);
		if (result === 'Success') {
			return new Response(null, { status: 200 });
		}
		return changeResultResponse(locals.locale, result);
	}
	return errorResponse(locals.locale, 400, 'error.missingData');
};
