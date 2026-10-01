import type { TranslationKey } from '$lib/i18n';

/**
 * Die Meldung aus dem Body einer Fehlerantwort – `{ message }` liefern sowohl
 * `errorResponse()` (src/lib/controller/error-response.ts) als auch SvelteKits `error()`.
 *
 * @returns die Meldung, oder null, wenn der Body keine brauchbare enthält
 */
export function messageFromErrorBody(body: unknown): string | null {
	if (typeof body === 'object' && body !== null && 'message' in body) {
		const message: unknown = (body as { message: unknown }).message;
		if (typeof message === 'string' && message.trim()) {
			return message;
		}
	}
	return null;
}

/** Rückfall, wenn der Server keine Meldung mitschickt (etwa ein Proxy-Fehler von nginx). */
export function fallbackKeyForStatus(status: number): TranslationKey {
	switch (status) {
		case 401:
			return 'error.notAuthenticated';
		case 403:
			return 'error.forbidden';
		case 404:
			return 'error.notFound';
		case 413:
			return 'error.tooLarge';
		case 429:
			return 'error.tooManyRequests';
		default:
			return status >= 500 ? 'error.internal' : 'error.unknown';
	}
}
