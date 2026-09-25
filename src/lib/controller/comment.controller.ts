import type { RequestEvent } from '@sveltejs/kit';
import { CurrentUser } from '$lib/models/user/CurrentUser';
import { CommentService, type CommentTarget } from '$lib/services/comment.service';
import { FrontendComment } from '$lib/models/transferData/FrontendComment';
import { ChangeResult, getHTTPCodeForChangeResult } from '$lib/models/updates/ChangeResult';
import { COMMENT_TEXT_LIMITS, findTooLongField } from '$lib/services/text-length.logic';
import { t } from '$lib/i18n';

/**
 * Bestimmt das Kommentarziel aus dem URL-Pfad: Festival (`festival_id`) oder
 * Nutzerprofil (`user_id`).
 *
 * @param request - RequestEvent mit params
 * @returns Das Ziel, oder undefined, wenn der Pfad keins enthält
 */
function getTargetFromPath(request: RequestEvent): CommentTarget | undefined {
	const festivalId = request.params.festival_id?.toString();
	if (festivalId) {
		return { festivalId };
	}
	const userId = request.params.user_id?.toString();
	return userId ? { profileUserId: userId } : undefined;
}

/**
 * 422-Antwort für einen zu langen Kommentar, oder null, wenn die Länge passt.
 * Ohne diese Prüfung scheitert ein überlanger Text erst an der DB-Spalte (siehe
 * text-length.logic.ts) – in Produktion als 500, lokal auf SQLite gar nicht.
 */
function tooLongResponse(request: RequestEvent, comment: unknown): Response | null {
	const tooLong = findTooLongField({ comment }, COMMENT_TEXT_LIMITS);
	if (tooLong) {
		return new Response(t(request.locals.locale, 'error.inputTooLong', { max: tooLong.max }), { status: 422 });
	}
	return null;
}

/**
 * Erstellt einen neuen Kommentar für ein Festival oder Nutzerprofil.
 * Wird von POST /festival/:id/comments und POST /user/:id/comments verwendet.
 *
 * Erwartet FormData mit Feld "comment" (string).
 *
 * @returns 200 bei Erfolg, 401 ohne Session, 400 bei fehlenden Daten,
 *          422 bei zu langem Text oder nicht existierendem Ziel
 */
export async function POSTComment(request: RequestEvent): Promise<Response> {
	const data: FormData = await request.request.formData();
	const comment: string | undefined = data.get('comment')?.toString();
	const target: CommentTarget | undefined = getTargetFromPath(request);
	const user: CurrentUser | undefined = request.locals.currentUser;

	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (comment && target) {
		const tooLong = tooLongResponse(request, comment);
		if (tooLong) {
			return tooLong;
		}
		const result: ChangeResult = await CommentService.saveComment(user.id, target, comment);
		if (result !== 'Success') {
			return new Response(JSON.stringify(result), { status: getHTTPCodeForChangeResult(result) });
		}
		const comments = await CommentService.getComments(target, user.id);
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
	const target: CommentTarget | undefined = getTargetFromPath(request);
	const user: CurrentUser | undefined = request.locals.currentUser;
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (target) {
		const comments: FrontendComment[] = await CommentService.getComments(target, user.id);
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
 * @returns HTTP-Code entsprechend ChangeResult, 401 ohne Session, 400 bei fehlenden Daten,
 *          422 bei zu langem Text
 */
export async function PUTComment(request: RequestEvent): Promise<Response> {
	const comment = (await request.request.json()) as FrontendComment;
	const user: CurrentUser | undefined = request.locals.currentUser;
	const target: CommentTarget | undefined = getTargetFromPath(request);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (comment && target) {
		const tooLong = tooLongResponse(request, comment.comment);
		if (tooLong) {
			return tooLong;
		}
		const result: ChangeResult = await CommentService.updateComment(user.id, comment.id, comment.comment);
		if (result === 'Success') {
			const comments = await CommentService.getComments(target, user.id);
			return new Response(JSON.stringify(comments), { status: 200 });
		}
		return new Response(JSON.stringify(result), { status: getHTTPCodeForChangeResult(result) });
	}
	return new Response('Bad Request', { status: 400 });
}
