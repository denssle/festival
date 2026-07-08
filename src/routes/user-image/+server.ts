import type { Cookies } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
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
export const POST: RequestHandler = async ({
	cookies,
	request
}: {
	cookies: Cookies;
	request: Request;
}): Promise<Response> => {
	if (request.body) {
		const blob: Blob = await request.blob();
		const base64Img: string = await blob.text();
		const extractUser: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
		if (!extractUser) {
			return new Response('Unauthorized', { status: 401 });
		}
		if (base64Img) {
			// Serverseitige Validierung (Größe/Typ) – die Client-Prüfung ist umgehbar.
			const validation = validateImageDataUri(base64Img);
			if (!validation.valid) {
				return new Response(validation.reason, { status: STATUS_FOR_IMAGE_ERROR[validation.error] });
			}
			await UserService.saveUserImage(extractUser.id, base64Img);
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
export const GET: RequestHandler = async ({ cookies }: { cookies: Cookies }): Promise<Response> => {
	const extractUser: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
	if (!extractUser) {
		return new Response('Unauthorized', { status: 401 });
	}
	return new Response(await UserService.getUserImage(extractUser.id), { status: 200 });
};
