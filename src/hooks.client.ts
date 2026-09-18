import type { HandleClientError } from '@sveltejs/kit';
import { t } from '$lib/i18n';
import { currentLocale } from '$lib/i18n/tr';

// https://kit.svelte.dev/docs/hooks
// Gegenstück zum `handleError` in hooks.server.ts, für Fehler bei der Client-Navigation.
// Die Sprache kommt aus den Layout-Daten der zuletzt angezeigten Seite (siehe
// `currentLocale`); fehlen sie, gilt die Standardsprache.
export const handleError = (async ({ error, status }) => {
	const errorId = crypto.randomUUID();
	console.error(error);
	return {
		message: t(currentLocale(), status === 404 ? 'error.notFound' : 'error.internal'),
		errorId
	};
}) satisfies HandleClientError;
