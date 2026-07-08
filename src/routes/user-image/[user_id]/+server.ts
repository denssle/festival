import type { RequestHandler } from './$types';
import { UserService } from '$lib/services/user.service';

/**
 * GET /user-image/:user_id
 *
 * Gibt das Profilbild eines beliebigen Nutzers anhand seiner ID zurück.
 * Erfordert eine gültige Session (durch den globalen Auth-Hook in hooks.server.ts erzwungen).
 *
 * @param params.user_id - ID des Nutzers, dessen Bild abgerufen werden soll
 * @returns 200 mit Base64-Bilddaten, 404 wenn kein Bild vorhanden
 */
export const GET: RequestHandler = async ({ params }): Promise<Response> => {
	if (params && params.user_id) {
		const imageData: string | null = await UserService.getUserImage(params.user_id);
		if (imageData) {
			return new Response(imageData, { status: 200 });
		}
	}
	return new Response(null, { status: 404 });
};
