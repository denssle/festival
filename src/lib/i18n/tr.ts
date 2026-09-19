import { page } from '$app/state';
import { DEFAULT_LOCALE, isLocale, type Locale } from './locale.logic';
import { t, type TranslationKey } from './index';

/**
 * Aktive Sprache für Komponenten.
 *
 * Liest `locale` aus `page.data` – das enthält die Daten aller Layouts, und das
 * Root-Layout (`+layout.server.ts`) reicht `locals.locale` dorthin durch. Damit muss
 * die Sprache nicht als Prop durch jede Komponente und jeden Dialog gereicht werden.
 *
 * Nur während des Renderns aufrufen (im Markup oder in `$derived`), nicht auf
 * Modulebene: `page` ist an den laufenden Request bzw. die aktuelle Seite gebunden.
 * Der Rückfall auf die Standardsprache greift, falls eine Seite ohne Layout-Daten
 * rendert (z. B. eine Fehlerseite vor dem ersten Load).
 */
export function currentLocale(): Locale {
	const locale: unknown = page.data.locale;
	return typeof locale === 'string' && isLocale(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * Übersetzt einen Schlüssel in die aktive Sprache – die Kurzform für Komponenten.
 * Serverseitiger Code (Actions, Hooks) nimmt weiterhin `t(locals.locale, …)`,
 * dort gibt es kein `page`.
 */
export function tr(key: TranslationKey, parameters?: Record<string, string | number>): string {
	return t(currentLocale(), key, parameters);
}
