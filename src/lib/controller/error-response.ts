import { json } from '@sveltejs/kit';
import { t, type Locale, type TranslationKey } from '$lib/i18n';
import {
	type ChangeResult,
	getHTTPCodeForChangeResult,
	getMessageForChangeResult
} from '$lib/models/updates/ChangeResult';

/**
 * Einheitliche Fehlerantwort aller JSON-Endpunkte (`+server.ts`): `{ message }` mit einem
 * Text in der Sprache des Nutzers und dem passenden Status. Dasselbe Format liefert
 * SvelteKits `error()` – der Client liest beides mit `request()` (src/lib/utils/request.ts).
 *
 * Vorher gab es sechs Formate nebeneinander (englischer Klartext, übersetzter Klartext,
 * JSON-kodierter ChangeResult, leerer Body, …), und der Client zeigte meist gar nichts an.
 */
export function errorResponse(
	locale: Locale,
	status: number,
	key: TranslationKey,
	parameters?: Record<string, string | number>
): Response {
	return json({ message: t(locale, key, parameters) }, { status });
}

/** Fehlerantwort zu einem Service-Ergebnis, Status nach `getHTTPCodeForChangeResult`. */
export function changeResultResponse(locale: Locale, result: ChangeResult): Response {
	return json({ message: getMessageForChangeResult(locale, result) }, { status: getHTTPCodeForChangeResult(result) });
}
