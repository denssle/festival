import { type Locale, t, type TranslationKey } from '$lib/i18n';

export type ChangeResult = 'Success' | 'Not authorized' | 'Data Missing' | 'Already in Group' | 'Failure';

export function getHTTPCodeForChangeResult(result: ChangeResult): 200 | 403 | 422 | 409 | 500 {
	switch (result) {
		case 'Success':
			return 200;
		case 'Not authorized':
			return 403;
		case 'Data Missing':
			return 422;
		case 'Already in Group':
			return 409;
		case 'Failure':
			return 500;
	}
}

/** Schlüssel je Ergebniscode. Getrennt von der Funktion, damit der Compiler die
 *  Vollständigkeit über `Record` erzwingt – ein neuer ChangeResult-Wert ohne Meldung
 *  ist damit ein Fehler und keine leere Anzeige. */
const MESSAGE_KEYS: Record<ChangeResult, TranslationKey> = {
	Success: 'changeResult.success',
	'Not authorized': 'changeResult.notAuthorized',
	'Data Missing': 'changeResult.dataMissing',
	'Already in Group': 'changeResult.alreadyInGroup',
	Failure: 'changeResult.failure'
};

/**
 * Übersetzt einen Ergebniscode in eine Meldung für die Oberfläche.
 *
 * Das Gegenstück zu `getHTTPCodeForChangeResult`: Dort wird der Code zum Statuscode,
 * hier zum Text. Vorher wurde der Enumwert selbst als `message` durchgereicht und stand
 * dann roh in der Oberfläche ("Data Missing"), unabhängig von der gewählten Sprache.
 */
export function getMessageForChangeResult(locale: Locale, result: ChangeResult): string {
	return t(locale, MESSAGE_KEYS[result]);
}
