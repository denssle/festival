import type { Locale } from '../src/lib/i18n';

/**
 * Sprache, in der die E2E-Suite läuft.
 *
 * Einzige Quelle für zwei Dinge, die zwingend zusammenpassen müssen:
 * `playwright.config.ts` leitet daraus die Browser-Sprache ab (die App wertet
 * `Accept-Language` aus), und `uiText()` in `test-utils.ts` liefert die erwarteten
 * Texte in derselben Sprache. Stehen sie auseinander, prüft die Suite deutsche
 * Erwartungen gegen eine englische Oberfläche.
 *
 * Diese Konstante umzustellen fährt die gesamte Suite in der anderen Sprache. Das ist
 * beabsichtigt: Es ist die Gegenprobe darauf, dass kein Test mehr an Beschriftungen
 * hängt. Solange die Oberfläche noch nicht übersetzt ist (Schritt 4), schlagen dabei
 * genau die Specs fehl, die noch deutschen Markup-Text erwarten.
 */
export const UI_LOCALE: Locale = 'de';

/** Browser-Sprachcode für Playwright, abgeleitet aus {@link UI_LOCALE}. */
export const BROWSER_LOCALE: string = UI_LOCALE === 'de' ? 'de-DE' : 'en-US';
