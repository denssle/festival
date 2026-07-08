import type { RequestEvent } from '@sveltejs/kit';
import { POSTComment, GETComments, DELETEComment, PUTComment } from '$lib/controller/comment.controller';

/**
 * POST /user/:user_id/comments
 *
 * Erstellt einen neuen Kommentar auf dem Profil des Nutzers.
 * Erwartet FormData mit dem Feld "comment".
 *
 * @param request - RequestEvent mit user_id in params, session-Cookie und FormData im Body
 * @returns 200 bei Erfolg, 500 bei fehlenden Daten oder Fehler
 */
export async function POST(request: RequestEvent): Promise<Response> {
	return await POSTComment(request);
}

/**
 * GET /user/:user_id/comments
 *
 * Gibt alle Kommentare auf dem Profil des Nutzers zurück.
 *
 * @param request - RequestEvent mit user_id in params und session-Cookie
 * @returns 200 mit JSON-Array von FrontendComment, 500 bei fehlenden Daten
 */
export async function GET(request: RequestEvent): Promise<Response> {
	return await GETComments(request);
}

/**
 * DELETE /user/:user_id/comments
 *
 * Löscht einen Kommentar vom Nutzerprofil anhand seiner ID.
 * Nur der Autor des Kommentars darf ihn löschen.
 *
 * @param request - RequestEvent mit session-Cookie; Body enthält die Kommentar-ID als Plaintext
 * @returns HTTP-Code entsprechend ChangeResult, 500 bei fehlenden Daten
 */
export async function DELETE(request: RequestEvent): Promise<Response> {
	return await DELETEComment(request);
}

/**
 * PUT /user/:user_id/comments
 *
 * Aktualisiert den Text eines Kommentars auf dem Nutzerprofil.
 * Nur der Autor des Kommentars darf ihn bearbeiten.
 *
 * @param request - RequestEvent mit session-Cookie; Body enthält FrontendComment als JSON
 * @returns HTTP-Code entsprechend ChangeResult, 500 bei fehlenden Daten
 */
export async function PUT(request: RequestEvent): Promise<Response> {
	return await PUTComment(request);
}
