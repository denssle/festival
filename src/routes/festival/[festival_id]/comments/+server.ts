import { RequestEvent } from '@sveltejs/kit';
import { DELETEComment, GETComments, POSTComment, PUTComment } from '$lib/controller/comment.controller';

/**
 * POST /festival/:festival_id/comments
 *
 * Erstellt einen neuen Kommentar für ein Festival.
 * Erwartet FormData mit dem Feld "comment".
 *
 * @param request - RequestEvent mit festival_id in params, session-Cookie und FormData im Body
 * @returns 200 bei Erfolg, 500 bei fehlenden Daten oder Fehler
 */
export async function POST(request: RequestEvent): Promise<Response> {
	return await POSTComment(request);
}

/**
 * GET /festival/:festival_id/comments
 *
 * Gibt alle Kommentare eines Festivals zurück.
 *
 * @param request - RequestEvent mit festival_id in params und session-Cookie
 * @returns 200 mit JSON-Array von FrontendComment, 500 bei fehlenden Daten
 */
export async function GET(request: RequestEvent): Promise<Response> {
	return await GETComments(request);
}

/**
 * DELETE /festival/:festival_id/comments
 *
 * Löscht einen Kommentar anhand seiner ID.
 * Nur der Autor des Kommentars darf ihn löschen.
 *
 * @param request - RequestEvent mit session-Cookie; Body enthält die Kommentar-ID als Plaintext
 * @returns HTTP-Code entsprechend ChangeResult, 500 bei fehlenden Daten
 */
export async function DELETE(request: RequestEvent): Promise<Response> {
	return await DELETEComment(request);
}

/**
 * PUT /festival/:festival_id/comments
 *
 * Aktualisiert den Text eines bestehenden Kommentars.
 * Nur der Autor des Kommentars darf ihn bearbeiten.
 *
 * @param request - RequestEvent mit session-Cookie; Body enthält FrontendComment als JSON
 * @returns HTTP-Code entsprechend ChangeResult, 500 bei fehlenden Daten
 */
export async function PUT(request: RequestEvent): Promise<Response> {
	return await PUTComment(request);
}
