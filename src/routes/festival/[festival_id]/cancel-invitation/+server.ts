import { UserService } from '$lib/services/user.service';
import type { RequestHandler } from '@sveltejs/kit';
import { GuestInformationService } from '$lib/services/guest-information.service';

/**
 * POST /festival/:festival_id/cancel-invitation
 *
 * Storniert die Einladung eines Nutzers zu einem Festival.
 * Der optionale Kommentar im Request-Body wird als Begründung gespeichert.
 *
 * @param cookies - Session-Cookie zur Authentifizierung
 * @param params.festival_id - ID des Festivals
 * @param request - Body enthält einen optionalen Kommentar als Plaintext
 * @returns 200 bei Erfolg, 401 wenn nicht eingeloggt, 400 bei fehlender festival_id
 */
export const POST: RequestHandler = async ({ cookies, params, request }) => {
	const extractUser = UserService.extractUser(cookies.get('session'));
	if (!extractUser) {
		return new Response('Unauthorized', { status: 401 });
	}

	const blob: Blob = await request.blob();
	const comment: string = await blob.text();

	if (params.festival_id) {
		await GuestInformationService.cancelInvitation(extractUser, params.festival_id, comment);
		return new Response(null, { status: 200 });
	}
	return new Response('Bad Request', { status: 400 });
};
