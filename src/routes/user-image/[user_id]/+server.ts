import { createHash } from 'node:crypto';
import type { RequestHandler } from './$types';
import { UserService } from '$lib/services/user.service';

/**
 * Caching-Vorgabe für Avatare.
 *
 * `private`, weil die Antwort nur mit gültiger Session zustande kommt und deshalb nicht in
 * gemeinsamen Caches (nginx & Co.) landen darf. Das kurze `max-age` hält ein frisch
 * hochgeladenes Bild schnell aktuell; danach kostet die Prüfung dank ETag nur noch ein 304
 * ohne Bilddaten. Ohne diese Header lud jede Profil- und Listenseite alle Avatare komplett
 * neu – der clientseitige LRU-Store greift nur innerhalb einer Seiten-Session.
 */
const CACHE_CONTROL = 'private, max-age=60, must-revalidate';

/** Inhaltsbasierter ETag – ändert sich genau dann, wenn ein neues Bild gespeichert wurde. */
function buildETag(imageData: string): string {
	return `"${createHash('sha1').update(imageData).digest('hex')}"`;
}

/**
 * GET /user-image/:user_id
 *
 * Gibt das Profilbild eines beliebigen Nutzers anhand seiner ID zurück.
 * Erfordert eine gültige Session (durch den globalen Auth-Hook in hooks.server.ts erzwungen).
 *
 * Kein Profilbild zu haben ist der Normalfall und kein Fehler – deshalb 204 statt 404.
 * Ein 404 pro bildlosem Avatar füllte die Browser-Konsole mit Fehlern, obwohl der Client
 * den Fall längst über das Fallback-Bild abfängt.
 *
 * @param params.user_id - ID des Nutzers, dessen Bild abgerufen werden soll
 * @returns 200 mit Base64-Bilddaten, 304 wenn der Client das Bild bereits hat,
 *          204 wenn der Nutzer kein Bild hinterlegt hat
 */
export const GET: RequestHandler = async ({ params, request }): Promise<Response> => {
	if (params && params.user_id) {
		const imageData: string | null = await UserService.getUserImage(params.user_id);
		if (imageData) {
			const etag: string = buildETag(imageData);
			if (request.headers.get('if-none-match') === etag) {
				return new Response(null, { status: 304, headers: { etag, 'cache-control': CACHE_CONTROL } });
			}
			return new Response(imageData, { status: 200, headers: { etag, 'cache-control': CACHE_CONTROL } });
		}
	}
	// Auch das "kein Bild"-Ergebnis darf der Browser kurz behalten, sonst bleibt genau der
	// häufigste Fall (Nutzer ohne Avatar) bei jedem Seitenaufruf ein voller Request.
	return new Response(null, { status: 204, headers: { 'cache-control': CACHE_CONTROL } });
};
