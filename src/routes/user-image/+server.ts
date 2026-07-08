import type { Cookies } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { UserService } from '$lib/services/user.service';

/**
 * POST /user-image
 *
 * Speichert das Profilbild des eingeloggten Nutzers.
 * Erwartet das Bild als Base64-kodierten String im Request-Body.
 *
 * @param cookies - Session-Cookie zur Authentifizierung
 * @param request - Body enthält das Bild als Base64-String (Plaintext)
 * @returns 200 bei Erfolg, 401 wenn nicht eingeloggt, 400 bei fehlendem Body oder Bilddaten
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
