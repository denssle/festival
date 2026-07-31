import type { RequestEvent } from '@sveltejs/kit';
import { CurrentUser } from '$lib/models/user/CurrentUser';
import { CommentService } from '$lib/services/comment.service';
import { FrontendComment } from '$lib/models/transferData/FrontendComment';
import { ChangeResult, getHTTPCodeForChangeResult } from '$lib/models/updates/ChangeResult';

/**
 * Extrahiert die relevante ID (festival_id oder user_id) aus dem URL-Pfad.
 *
 * @param request - RequestEvent mit params
 * @returns festival_id oder user_id als String, oder undefined
 */
function getIdFromPath(request: RequestEvent) {
	return request.params.festival_id?.toString() ?? request.params.user_id?.toString();
}

/**
 * Erstellt einen neuen Kommentar für ein Festival oder Nutzerprofil.
 * Wird von POST /festival/:id/comments und POST /user/:id/comments verwendet.
 *
 * Erwartet FormData mit Feld "comment" (string).
 *
 * @returns 200 bei Erfolg, 401 ohne Session, 400 bei fehlenden Daten
 */
export async function POSTComment(request: RequestEvent): Promise<Response> {
	const data: FormData = await request.request.formData();
	const comment: string | undefined = data.get('comment')?.toString();
	const pathId: string | undefined = getIdFromPath(request);
	const user: CurrentUser | undefined = request.locals.currentUser;

	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (comment && pathId) {
		await CommentService.saveComment(user.id, pathId, comment);
		const comments = await CommentService.getComments(pathId, user.id);
		return new Response(JSON.stringify(comments), { status: 200 });
	}
	return new Response('Bad Request', { status: 400 });
}

/**
 * Gibt alle Kommentare für ein Festival oder Nutzerprofil zurück.
 * Wird von GET /festival/:id/comments und GET /user/:id/comments verwendet.
 *
 * @returns 200 mit JSON-Array von FrontendComment, 401 ohne Session, 400 bei fehlender ID
 */
export async function GETComments(request: RequestEvent): Promise<Response> {
	const pathId: string | undefined = getIdFromPath(request);
	const user: CurrentUser | undefined = request.locals.currentUser;
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (pathId) {
		const comments: FrontendComment[] = await CommentService.getComments(pathId, user.id);
		return new Response(JSON.stringify(comments), { status: 200 });
	}
	return new Response('Bad Request', { status: 400 });
}

/**
 * Löscht einen Kommentar anhand seiner ID.
 * Wird von DELETE /festival/:id/comments und DELETE /user/:id/comments verwendet.
 * Nur der Autor des Kommentars darf ihn löschen.
 *
 * Body: Kommentar-ID als Plaintext.
 *
 * @returns HTTP-Code entsprechend ChangeResult, 401 ohne Session, 400 bei fehlender ID
 */
export async function DELETEComment(request: RequestEvent): Promise<Response> {
	const commentId: string = await request.request.text();
	const user: CurrentUser | undefined = request.locals.currentUser;
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (commentId) {
		const result: ChangeResult = await CommentService.deleteComment(user.id, commentId);
		return new Response(JSON.stringify(result), { status: getHTTPCodeForChangeResult(result) });
	}
	return new Response('Bad Request', { status: 400 });
}

/**
 * Aktualisiert den Text eines bestehenden Kommentars.
 * Wird von PUT /festival/:id/comments und PUT /user/:id/comments verwendet.
 * Nur der Autor des Kommentars darf ihn bearbeiten.
 *
 * Body: FrontendComment als JSON.
 *
 * @returns HTTP-Code entsprechend ChangeResult, 401 ohne Session, 400 bei fehlenden Daten
 */
export async function PUTComment(request: RequestEvent): Promise<Response> {
	const comment = (await request.request.json()) as FrontendComment;
	const user: CurrentUser | undefined = request.locals.currentUser;
	const pathId: string | undefined = getIdFromPath(request);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (comment && pathId) {
		const result: ChangeResult = await CommentService.updateComment(user.id, comment.id, comment.comment);
		if (result === 'Success') {
			const comments = await CommentService.getComments(pathId, user.id);
			return new Response(JSON.stringify(comments), { status: 200 });
		}
		return new Response(JSON.stringify(result), { status: getHTTPCodeForChangeResult(result) });
	}
	return new Response('Bad Request', { status: 400 });
}
