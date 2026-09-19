import { de } from './de';
import { en } from './en';
import { DEFAULT_LOCALE, interpolate, type Locale } from './locale.logic';

export {
	LOCALES,
	DEFAULT_LOCALE,
	isLocale,
	negotiateLocale,
	resolveLocale,
	safeRedirectTarget,
	type Locale
} from './locale.logic';

/** Alle Schlüssel, die es gibt – abgeleitet aus dem deutschen Wörterbuch (der Referenz). */
export type TranslationKey = keyof typeof de;

/** Ein vollständiges Wörterbuch. `en.ts` ist hierauf typisiert und damit prüfbar. */
export type Dictionary = Record<TranslationKey, string>;

const dictionaries: Record<Locale, Dictionary> = { de, en };

/**
 * Übersetzt einen Schlüssel in die gewünschte Sprache.
 *
 * @param locale - aktive Sprache, kommt aus `locals.locale` bzw. den Layout-Daten
 * @param key - Schlüssel aus `de.ts`; ein Tippfehler ist ein Compile-Fehler
 * @param parameters - optionale Werte für `{platzhalter}` im Text
 *
 * @example
 * t(locale, 'nav.settings');
 * t(locale, 'festival.organisedBy', { nickname: user.nickname });
 */
export function t(locale: Locale, key: TranslationKey, parameters?: Record<string, string | number>): string {
	// Der Fallback greift nur, wenn eine Sprache zur Laufzeit an der Typprüfung vorbei
	// hereinkommt (z. B. manipulierter Cookie trotz `isLocale`-Filter). Lieber deutscher
	// Text als eine leere Oberfläche.
	const dictionary: Dictionary = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
	return interpolate(dictionary[key], parameters);
}
