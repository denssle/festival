import type { ActionFailure } from '@sveltejs/kit';

export interface StandardResponse {
	success: boolean;
	message?: string;
	/**
	 * Bereich, aus dem die Antwort stammt. Nötig auf Seiten mit MEHREREN Actions:
	 * SvelteKit reicht dort nur ein gemeinsames `form`-Objekt zurück, ohne zu
	 * verraten, welche Action geantwortet hat – ohne diese Angabe erschiene die
	 * Meldung der einen Action im Formular der anderen (siehe /settings).
	 */
	scope?: string;
}

/** Scopes der beiden Actions auf /settings (siehe `scope`). */
export const PASSWORD_SCOPE = 'password';
export const ACCOUNT_SCOPE = 'account';

/**
 * Rückgabe einer Form-Action: Erfolg als `StandardResponse`, Fehler über
 * `fail(status, { success: false, message })` – mit echtem HTTP-Status statt 200
 * (seit v0.7.74, vorher gaben manche Actions Fehler mit 200 zurück).
 */
export type StandardActionResult = StandardResponse | ActionFailure<StandardResponse>;
