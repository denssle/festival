import { tr } from '$lib/i18n/tr';
import { fallbackKeyForStatus, messageFromErrorBody } from './request.logic';

export type RequestResult = { ok: true; response: Response } | { ok: false; message: string };

/**
 * `fetch()` für Komponenten, mit einheitlicher Fehlerbehandlung: Bei Erfolg die Antwort,
 * sonst eine Meldung in der aktiven Sprache, bereit zur Anzeige – die des Servers, wenn er
 * eine schickt, sonst ein Text passend zum Status. Netzwerkfehler (offline, Server weg)
 * werden ebenfalls zur Meldung, statt als unbehandelte Ausnahme zu verpuffen.
 *
 * Nur im Browser aufrufen (Event-Handler, Effekte): `tr()` liest die Sprache der
 * angezeigten Seite.
 */
export async function request(input: string, init?: RequestInit): Promise<RequestResult> {
	let response: Response;
	try {
		response = await fetch(input, init);
	} catch (error) {
		console.error('Netzwerkfehler bei', input, error);
		return { ok: false, message: tr('error.network') };
	}
	if (response.ok) {
		return { ok: true, response };
	}
	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		// Kein JSON (z. B. HTML-Fehlerseite von nginx) – dann greift der Rückfall.
	}
	return { ok: false, message: messageFromErrorBody(body) ?? tr(fallbackKeyForStatus(response.status)) };
}
