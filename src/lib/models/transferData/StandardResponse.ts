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
