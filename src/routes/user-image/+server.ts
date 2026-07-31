import type { RequestHandler } from './$types';
import { UserService } from '$lib/services/user.service';
import { validateImageDataUri, type ImageValidationError } from '$lib/services/image.logic';

/** Mappt einen Validierungsfehler auf einen passenden HTTP-Status. */
const STATUS_FOR_IMAGE_ERROR: Record<ImageValidationError, number> = {
	malformed: 400,
	empty: 400,
	type: 415, // Unsupported Media Type
	size: 413 // Payload Too Large
};

/**
 * POST /user-image
 *
 * Speichert das Profilbild des eingeloggten Nutzers.
 * Erwartet das Bild als Base64-kodierten String im Request-Body.
 *
 * @param cookies - Session-Cookie zur Authentifizierung
 * @param request - Body enthält das Bild als Base64-Data-URI (Plaintext)
 * @returns 200 bei Erfolg, 401 wenn nicht eingeloggt, 400 bei fehlendem Body,
 *          415 bei nicht erlaubtem Typ, 413 wenn zu groß
 */
export const POST: RequestHandler = async ({ locals, request }): Promise<Response> => {
	if (request.body) {
		const blob: Blob = await request.blob();
		const base64Img: string = await blob.text();
		const currentUser = locals.currentUser;
		if (!currentUser) {
			return new Response('Unauthorized', { status: 401 });
		}
		if (base64Img) {
			// Serverseitige Validierung (Größe/Typ) – die Client-Prüfung ist umgehbar.
			const validation = validateImageDataUri(base64Img);
			if (!validation.valid) {
				return new Response(validation.reason, { status: STATUS_FOR_IMAGE_ERROR[validation.error] });
			}
			await UserService.saveUserImage(currentUser.id, base64Img);
			return new Response(null, { status: 200 });
		}
	}
	return new Response('Bad Request', { status: 400 });
};

/**
 * GET /user-image
 *
 * Gibt das Profilbild des eingeloggten Nutzers als Base64-String zurück.
 *
 * @param cookies - Session-Cookie zur Authentifizierung
 * @returns 200 mit Base64-Bilddaten, 401 wenn nicht eingeloggt
 */
export const GET: RequestHandler = async ({ locals }): Promise<Response> => {
	const currentUser = locals.currentUser;
	if (!currentUser) {
		return new Response('Unauthorized', { status: 401 });
	}
	return new Response(await UserService.getUserImage(currentUser.id), { status: 200 });
};
