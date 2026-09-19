/**
 * Reine Logik rund um die Sprachwahl, ohne SvelteKit-Bezug: Welche Sprachen gibt es, wie
 * wird aus Cookie bzw. `Accept-Language` eine davon, wie werden Platzhalter ersetzt und
 * wohin darf der Umschalter zurückspringen. Bewusst frei von `$app/*`-Importen, damit die
 * Funktionen im Unit-Test (`locale.logic.spec.ts`) ohne Server laufen – siehe CLAUDE.md,
 * Abschnitt 5.
 */

export const LOCALES = ['de', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Fallback, wenn weder Cookie noch Browser etwas Brauchbares liefern. */
export const DEFAULT_LOCALE: Locale = 'de';

export function isLocale(value: string | undefined | null): value is Locale {
	return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Wertet einen `Accept-Language`-Header aus und liefert die beste unterstützte Sprache.
 *
 * Die Einträge sind zwar meist schon nach Präferenz sortiert, das ist aber nicht
 * garantiert – maßgeblich ist der q-Wert (RFC 9110, fehlt er, gilt q=1). Deshalb wird
 * hier wirklich sortiert und nicht bloß der erste Treffer genommen.
 *
 * Regionale Tags werden auf die Basissprache reduziert (`en-GB` → `en`), `*` und
 * Einträge mit `q=0` (explizite Ablehnung) werden ignoriert.
 *
 * @param header - Inhalt des `Accept-Language`-Headers, z. B. `'en-GB,en;q=0.9,de;q=0.8'`
 * @returns die beste unterstützte Sprache oder `null`, wenn keine passt
 */
export function negotiateLocale(header: string | null | undefined): Locale | null {
	if (!header) {
		return null;
	}

	const candidates: { locale: Locale; quality: number }[] = [];

	for (const part of header.split(',')) {
		const [tag, ...parameters] = part.trim().split(';');
		const language: string = tag.trim().split('-')[0].toLowerCase();

		if (!isLocale(language)) {
			continue;
		}

		// q-Parameter suchen; alles andere (z. B. veraltetes `level=1`) ignorieren.
		const qParameter: string | undefined = parameters
			.map((parameter) => parameter.trim())
			.find((parameter) => parameter.startsWith('q='));
		const quality: number = qParameter ? Number(qParameter.slice(2)) : 1;

		// `q=0` heißt "ausdrücklich nicht", NaN heißt kaputter Header – beides raus.
		if (!Number.isFinite(quality) || quality <= 0) {
			continue;
		}

		candidates.push({ locale: language, quality });
	}

	if (candidates.length === 0) {
		return null;
	}

	candidates.sort((a, b) => b.quality - a.quality);
	return candidates[0].locale;
}

/**
 * Bestimmt die aktive Sprache: Cookie schlägt Browser, Browser schlägt Standard.
 *
 * Der Cookie gewinnt bewusst – er ist die ausdrückliche Wahl des Nutzers über den
 * Umschalter im Footer und soll nicht bei jedem Request vom Browser überstimmt werden.
 *
 * @param cookieValue - Wert des Sprach-Cookies (roh, ungeprüft)
 * @param acceptLanguage - Inhalt des `Accept-Language`-Headers
 */
export function resolveLocale(cookieValue: string | undefined | null, acceptLanguage: string | null): Locale {
	if (isLocale(cookieValue)) {
		return cookieValue;
	}
	return negotiateLocale(acceptLanguage) ?? DEFAULT_LOCALE;
}

/**
 * Ersetzt `{name}`-Platzhalter in einem Übersetzungstext.
 *
 * Unbekannte Platzhalter bleiben unangetastet stehen. Das ist Absicht: Ein sichtbares
 * `{nickname}` in der Oberfläche zeigt sofort, dass ein Parameter fehlt – stiller
 * Leerstring würde den Fehler verstecken.
 */
export function interpolate(text: string, parameters?: Record<string, string | number>): string {
	if (!parameters) {
		return text;
	}
	return text.replace(/\{(\w+)\}/g, (match: string, name: string): string => {
		const value: string | number | undefined = parameters[name];
		return value === undefined ? match : String(value);
	});
}

/** Ein Stück eines Übersetzungstextes: entweder reiner Text oder ein Platz für ein Snippet. */
export type RichTextPart = { type: 'text'; value: string } | { type: 'slot'; name: string; inner: string };

/**
 * Zerlegt einen Übersetzungstext in Text und Plätze für Markup (Links, Hervorhebungen).
 *
 * `{name}` wird zum leeren Platz `name`, `{name:Text}` zum Platz mit innerem Text – so
 * bleibt auch das hervorgehobene Wort übersetzbar (`'Das ist {mark:keine} Mitbringparty.'`).
 * Gedacht für Texte, die schon durch `t()` gelaufen sind: `interpolate` fasst nur
 * `{name}` mit passendem Parameter an, alles andere kommt hier unverändert an.
 *
 * Vorher standen solche Sätze in Fragmenten im Wörterbuch ("Hinweis: Das ist" + "keine" +
 * "Mitbringparty."). Das legt die deutsche Wortstellung für jede Sprache fest.
 */
export function splitRichText(text: string): RichTextPart[] {
	const parts: RichTextPart[] = [];
	const pattern = /\{(\w+)(?::([^{}]*))?\}/g;
	let last = 0;

	for (const match of text.matchAll(pattern)) {
		if (match.index > last) {
			parts.push({ type: 'text', value: text.slice(last, match.index) });
		}
		parts.push({ type: 'slot', name: match[1], inner: match[2] ?? '' });
		last = match.index + match[0].length;
	}
	if (last < text.length) {
		parts.push({ type: 'text', value: text.slice(last) });
	}
	return parts;
}

/**
 * Prüft das Rücksprungziel des Sprachumschalters.
 *
 * Der Wert kommt aus einem Formularfeld und landet in einem `Location`-Header – ohne
 * Prüfung wäre das ein offener Redirect. Erlaubt ist ausschließlich ein Pfad innerhalb
 * dieser App.
 *
 * `base` wird übergeben statt importiert, damit die Funktion ohne `$app/paths` prüfbar
 * bleibt (und beide Fälle abgedeckt sind: mit Base-Pfad wie in Prod, ohne wie bei einer
 * Auslieferung auf der Domain-Wurzel).
 *
 * Abgewiesen werden damit unter anderem `//example.com` und `/\example.com` (der Browser
 * liest beides als fremden Host), absolute URLs und alles außerhalb des Base-Pfads.
 *
 * @param redirectTo - roher Wert aus dem Formular
 * @param base - Base-Pfad der App (`''` oder z. B. `'/festival'`)
 * @returns das geprüfte Ziel oder die Startseite als Rückfallebene
 */
export function safeRedirectTarget(redirectTo: string | null | undefined, base: string): string {
	const start = `${base}/`;

	if (!redirectTo || !redirectTo.startsWith(start)) {
		return start;
	}
	// Reihenfolge beachten: Bei leerem `base` ist `start` nur '/', dann käme '//host'
	// durch die Prüfung oben. Deshalb hier noch einmal explizit.
	if (redirectTo.startsWith('//') || redirectTo.startsWith('/\\')) {
		return start;
	}
	return redirectTo;
}
