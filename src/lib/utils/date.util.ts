import type { Locale } from '$lib/i18n';

/**
 * Zeitzone, in der die App Uhrzeiten versteht UND anzeigt.
 *
 * Feste finden an einem Ort statt; "20:00" meint die Uhrzeit dort, nicht die des Servers
 * oder des Browsers. Vorher hing beides an der Laufzeitumgebung: `getDateFromString` lief
 * in der Form-Action und las die Eingabe in der Zeitzone des SERVERS, die Anzeige rechnete
 * beim SSR ebenfalls in Server-Zeit, bei Client-Navigation aber in Browser-Zeit. Solange
 * alle drei zufällig Europe/Berlin sind, fällt das nicht auf.
 *
 * Alle Funktionen hier nehmen die Zeitzone als Parameter (mit dieser Vorgabe), damit die
 * Tests sie unabhängig von der Zeitzone des Testprozesses prüfen können.
 */
export const APP_TIME_ZONE = 'Europe/Berlin';

/** BCP-47-Tags für Intl. Englisch als en-GB: 24-Stunden-Uhr, passt zu "Organised" & Co. */
export const INTL_LOCALES: Record<Locale, string> = { de: 'de-DE', en: 'en-GB' };

/** `short` für Listen und Kommentare, `long` für die Startzeit auf der Festival-Seite. */
export type DateTimeStyle = 'short' | 'long';

const STYLES: Record<DateTimeStyle, Intl.DateTimeFormatOptions> = {
	short: { dateStyle: 'medium', timeStyle: 'short' },
	long: { dateStyle: 'full', timeStyle: 'short' }
};

interface WallClock {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
}

function toDate(value: Date | string | null | undefined): Date | null {
	if (!value) {
		return null;
	}
	// Strings kommen vor, wenn Daten per fetch() als JSON ankommen (z. B. Kommentare).
	const date: Date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

/** Uhrzeit, die eine Wanduhr in `timeZone` zum Zeitpunkt `instant` anzeigt. */
function wallClockAt(instant: number, timeZone: string): WallClock {
	const parts: Intl.DateTimeFormatPart[] = new Intl.DateTimeFormat('en-US', {
		timeZone,
		// h23 statt hour12:false: Ältere ICU-Stände zeigen Mitternacht sonst als "24".
		hourCycle: 'h23',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	}).formatToParts(new Date(instant));
	const get = (type: Intl.DateTimeFormatPartTypes): number => Number(parts.find((p) => p.type === type)?.value);
	return {
		year: get('year'),
		month: get('month'),
		day: get('day'),
		hour: get('hour'),
		minute: get('minute'),
		second: get('second')
	};
}

/** Abstand von `timeZone` zu UTC zum Zeitpunkt `instant`, in Millisekunden. */
function offsetAt(instant: number, timeZone: string): number {
	const w: WallClock = wallClockAt(instant, timeZone);
	const wallAsUtc: number = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
	return wallAsUtc - Math.floor(instant / 1000) * 1000;
}

/**
 * Rechnet eine Wanduhrzeit in `timeZone` in einen Zeitpunkt um.
 *
 * Zwei Durchgänge, weil der Versatz vom Zeitpunkt selbst abhängt (Sommerzeit). An den
 * Umstellungstagen gibt es Grenzfälle: 02:30 am letzten Märzsonntag existiert in Berlin
 * nicht und wird zu 03:30; 02:30 am letzten Oktobersonntag gibt es zweimal, genommen wird
 * das spätere (Winterzeit). Für Festbeginne ist beides vertretbar.
 */
export function wallClockToInstant(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	timeZone: string = APP_TIME_ZONE
): number {
	const naive: number = Date.UTC(year, month - 1, day, hour, minute);
	const firstGuess: number = naive - offsetAt(naive, timeZone);
	return naive - offsetAt(firstGuess, timeZone);
}

/**
 * Erzeugt einen Zeitpunkt (ms) aus den Werten eines Datums- und Uhrzeitfeldes.
 *
 * Ohne Uhrzeit gilt 12:00 – so bleibt das Datum in jeder Zeitzone derselbe Kalendertag.
 *
 * Vorher wurde eine Startzeit zwischen 00:00 und 00:59 verworfen: Die Prüfung
 * `times.at(0)` war für die Stunde 0 falsy, das Fest bekam stillschweigend gar kein Datum.
 *
 * @param date `yyyy-mm-dd` (Wert eines `<input type="date">`)
 * @param time `hh:mm` (Wert eines `<input type="time">`), darf leer sein
 * @returns Zeitpunkt in ms oder null bei fehlender bzw. ungültiger Eingabe
 */
export function getDateFromString(date: string, time: string, timeZone: string = APP_TIME_ZONE): number | null {
	const dateMatch: RegExpExecArray | null = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? '');
	if (!dateMatch) {
		return null;
	}
	const [year, month, day] = dateMatch.slice(1).map(Number);
	// Den Tag gegen den echten Monat prüfen, nicht nur gegen 31: `Date.UTC` rollt einen
	// 31.02. sonst stillschweigend auf den 03.03. weiter.
	if (month < 1 || month > 12 || day < 1 || new Date(Date.UTC(year, month - 1, day)).getUTCDate() !== day) {
		return null;
	}

	let hour = 12;
	let minute = 0;
	if (time) {
		const timeMatch: RegExpExecArray | null = /^(\d{1,2}):(\d{2})/.exec(time);
		if (!timeMatch) {
			return null;
		}
		hour = Number(timeMatch[1]);
		minute = Number(timeMatch[2]);
		if (hour > 23 || minute > 59) {
			return null;
		}
	}
	return wallClockToInstant(year, month, day, hour, minute, timeZone);
}

function pad(value: number): string {
	return String(value).padStart(2, '0');
}

/**
 * Wert für ein `<input type="date">` (`yyyy-mm-dd`) in der App-Zeitzone.
 *
 * Ersetzt `dateToString`, das das Datum aus `toISOString()` nahm, also in UTC – während
 * die Uhrzeit daneben lokal war. Ein Fest am 20.09. um 00:30 Berliner Zeit stand im
 * Bearbeiten-Formular damit als 19.09., 00:30; einmal Speichern, und es war einen Tag früher.
 */
export function toDateInputValue(value: Date | string | null | undefined, timeZone: string = APP_TIME_ZONE): string {
	const date: Date | null = toDate(value);
	if (!date) {
		return '';
	}
	const w: WallClock = wallClockAt(date.getTime(), timeZone);
	return `${w.year}-${pad(w.month)}-${pad(w.day)}`;
}

/** Wert für ein `<input type="time">` (`hh:mm`) in der App-Zeitzone. */
export function toTimeInputValue(value: Date | string | null | undefined, timeZone: string = APP_TIME_ZONE): string {
	const date: Date | null = toDate(value);
	if (!date) {
		return '';
	}
	const w: WallClock = wallClockAt(date.getTime(), timeZone);
	return `${pad(w.hour)}:${pad(w.minute)}`;
}

/**
 * Datum und Uhrzeit für die Anzeige, in der Sprache des Nutzers und der App-Zeitzone.
 *
 * Ersetzt `formateDateTime` (fest deutsches Format, Sekunden bei Festbeginnen) und die
 * nackten `toLocaleString()`-Aufrufe, die Sprache UND Zeitzone der Laufzeit nahmen – beim
 * Server-Rendering also die des Servers, nach einer Client-Navigation die des Browsers.
 */
export function formatDateTime(
	value: Date | string | null | undefined,
	locale: Locale,
	style: DateTimeStyle = 'short',
	timeZone: string = APP_TIME_ZONE
): string {
	const date: Date | null = toDate(value);
	if (!date) {
		return '';
	}
	return new Intl.DateTimeFormat(INTL_LOCALES[locale], { ...STYLES[style], timeZone }).format(date);
}
