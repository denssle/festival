import type { RequestHandler } from '@sveltejs/kit';
import { UserService } from '$lib/services/user.service';

/**
 * GET /user-image/:user_id
 *
 * Gibt das Profilbild eines beliebigen Nutzers anhand seiner ID zurück.
 * Kein Login erforderlich (öffentlicher Endpunkt).
 *
 * @param params.user_id - ID des Nutzers, dessen Bild abgerufen werden soll
 * @returns 200 mit Base64-Bilddaten, 404 wenn kein Bild vorhanden
 */
// TODO Add Types to the parameters
export const GET: RequestHandler = async ({ params }): Promise<Response> => {
	if (params && params.user_id) {
		const imageData: string | null = await UserService.getUserImage(params.user_id);
		if (imageData) {
			return new Response(imageData, { status: 200 });
		}
	}
	return new Response(null, { status: 404 });
};
