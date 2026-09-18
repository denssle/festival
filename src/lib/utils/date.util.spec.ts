import { describe, expect, it } from 'vitest';
import {
	APP_TIME_ZONE,
	formatDateTime,
	getDateFromString,
	toDateInputValue,
	toTimeInputValue,
	wallClockToInstant
} from './date.util';

/**
 * Zur Aussagekraft dieser Tests: Sie vergleichen gegen feste UTC-Zeitpunkte und rechnen
 * bewusst auch in Zeitzonen, die weder Berlin noch UTC sind. Würde eine Funktion
 * versehentlich die Zeitzone des Prozesses benutzen (getHours, new Date(j, m, t) …), fiele
 * das auf einem Berliner Entwicklungsrechner bei New York/Tokio auf. Die Prozess-Zeitzone
 * im Test umzustellen geht nicht zuverlässig: Node unter Windows ignoriert die
 * Umgebungsvariable TZ.
 *
 * ACHTUNG: Die CI (tests.yml) fährt nur Playwright, keine Unit-Tests. Diese Datei läuft
 * also nur lokal. Den Fall "Server in UTC" deckt stattdessen tests/dates.spec.ts ab, der in
 * der CI auf einem GitHub-Runner läuft (Voreinstellung dort: UTC).
 */
const iso = (ms: number | null): string | null => (ms === null ? null : new Date(ms).toISOString());

describe('APP_TIME_ZONE', () => {
	it('sollte Berlin sein', () => {
		expect(APP_TIME_ZONE).toBe('Europe/Berlin');
	});
});

describe('getDateFromString', () => {
	it('sollte die Eingabe als Berliner Zeit lesen (Sommerzeit)', () => {
		expect(iso(getDateFromString('2026-09-20', '20:00'))).toBe('2026-09-20T18:00:00.000Z');
	});

	it('sollte die Eingabe als Berliner Zeit lesen (Winterzeit)', () => {
		expect(iso(getDateFromString('2026-01-15', '20:00'))).toBe('2026-01-15T19:00:00.000Z');
	});

	it('sollte Startzeiten kurz nach Mitternacht annehmen', () => {
		// Früher: null, weil die Stunde 0 als "keine Uhrzeit" galt.
		expect(iso(getDateFromString('2026-09-20', '00:30'))).toBe('2026-09-19T22:30:00.000Z');
		expect(iso(getDateFromString('2026-09-20', '00:00'))).toBe('2026-09-19T22:00:00.000Z');
	});

	it('sollte ohne Uhrzeit 12:00 annehmen', () => {
		expect(iso(getDateFromString('2026-09-20', ''))).toBe('2026-09-20T10:00:00.000Z');
	});

	it('sollte sekundengenaue Uhrzeitfelder verstehen', () => {
		expect(iso(getDateFromString('2026-09-20', '20:00:00'))).toBe('2026-09-20T18:00:00.000Z');
	});

	it('sollte ungültige Eingaben ablehnen', () => {
		expect(getDateFromString('', '20:00')).toBeNull();
		expect(getDateFromString('20.09.2026', '20:00')).toBeNull();
		expect(getDateFromString('2026-13-01', '20:00')).toBeNull();
		expect(getDateFromString('2026-09-00', '20:00')).toBeNull();
		expect(getDateFromString('2026-09-20', '25:00')).toBeNull();
		expect(getDateFromString('2026-09-20', '20:60')).toBeNull();
		expect(getDateFromString('2026-09-20', 'abends')).toBeNull();
	});

	it('sollte die übergebene Zeitzone benutzen, nicht die des Prozesses', () => {
		expect(iso(getDateFromString('2026-09-20', '20:00', 'America/New_York'))).toBe('2026-09-21T00:00:00.000Z');
		expect(iso(getDateFromString('2026-09-20', '20:00', 'Asia/Tokyo'))).toBe('2026-09-20T11:00:00.000Z');
		expect(iso(getDateFromString('2026-09-20', '20:00', 'UTC'))).toBe('2026-09-20T20:00:00.000Z');
	});
});

describe('wallClockToInstant an den Umstellungstagen', () => {
	it('sollte die übersprungene Stunde im März nach vorn schieben', () => {
		// 02:30 gibt es am 29.03.2026 in Berlin nicht; gemeint ist dann 03:30 Sommerzeit.
		expect(iso(wallClockToInstant(2026, 3, 29, 2, 30))).toBe('2026-03-29T01:30:00.000Z');
	});

	it('sollte bei der doppelten Stunde im Oktober die spätere nehmen', () => {
		expect(iso(wallClockToInstant(2026, 10, 25, 2, 30))).toBe('2026-10-25T01:30:00.000Z');
	});

	it('sollte direkt vor und nach den Umstellungen stimmen', () => {
		expect(iso(wallClockToInstant(2026, 3, 29, 1, 59))).toBe('2026-03-29T00:59:00.000Z');
		expect(iso(wallClockToInstant(2026, 3, 29, 3, 0))).toBe('2026-03-29T01:00:00.000Z');
		expect(iso(wallClockToInstant(2026, 10, 25, 3, 0))).toBe('2026-10-25T02:00:00.000Z');
	});
});

describe('toDateInputValue / toTimeInputValue', () => {
	it('sollte Datum und Uhrzeit in Berliner Zeit liefern', () => {
		const start = new Date('2026-09-20T18:00:00.000Z');
		expect(toDateInputValue(start)).toBe('2026-09-20');
		expect(toTimeInputValue(start)).toBe('20:00');
	});

	it('sollte kurz nach Mitternacht nicht auf den Vortag springen', () => {
		// Der Bug im Bearbeiten-Formular: Das Datum kam aus toISOString(), also UTC -
		// hier noch der 19.09. -, die Uhrzeit dagegen lokal.
		const start = new Date('2026-09-19T22:30:00.000Z');
		expect(toDateInputValue(start)).toBe('2026-09-20');
		expect(toTimeInputValue(start)).toBe('00:30');
	});

	it('sollte Eingabe -> Speichern -> Formular verlustfrei durchlaufen', () => {
		const faelle: [string, string][] = [
			['2026-09-20', '20:00'],
			['2026-09-20', '00:30'],
			['2026-01-01', '00:00'],
			['2026-12-31', '23:59'],
			['2026-03-29', '01:59'],
			['2026-10-25', '03:00']
		];
		for (const [datum, uhrzeit] of faelle) {
			const gespeichert: number | null = getDateFromString(datum, uhrzeit);
			expect(toDateInputValue(new Date(gespeichert!)), `${datum} ${uhrzeit}`).toBe(datum);
			expect(toTimeInputValue(new Date(gespeichert!)), `${datum} ${uhrzeit}`).toBe(uhrzeit);
		}
	});

	it('sollte Strings annehmen (Daten aus JSON)', () => {
		expect(toDateInputValue('2026-09-20T18:00:00.000Z')).toBe('2026-09-20');
	});

	it('sollte ohne Datum leere Werte liefern', () => {
		expect(toDateInputValue(null)).toBe('');
		expect(toTimeInputValue(undefined)).toBe('');
		expect(toDateInputValue('kein Datum')).toBe('');
	});
});

describe('formatDateTime', () => {
	const start = new Date('2026-09-20T18:00:00.000Z');

	it('sollte auf Deutsch formatieren', () => {
		expect(formatDateTime(start, 'de')).toBe('20.09.2026, 20:00');
		expect(formatDateTime(start, 'de', 'long')).toBe('Sonntag, 20. September 2026 um 20:00');
	});

	it('sollte auf Englisch formatieren', () => {
		// ICU-Stände unterscheiden sich im Monatskürzel ("Sep" vs. "Sept"), deshalb kein
		// exakter Vergleich bei der Kurzform.
		expect(formatDateTime(start, 'en')).toMatch(/^20 Sept? 2026, 20:00$/);
		expect(formatDateTime(start, 'en', 'long')).toBe('Sunday, 20 September 2026 at 20:00');
	});

	it('sollte keine Sekunden mehr zeigen', () => {
		expect(formatDateTime(new Date('2026-09-20T18:00:42.000Z'), 'de')).toBe('20.09.2026, 20:00');
	});

	it('sollte Mitternacht als 00 zeigen, nicht als 24', () => {
		expect(formatDateTime(new Date('2026-09-19T22:30:00.000Z'), 'de')).toBe('20.09.2026, 00:30');
	});

	it('sollte in der übergebenen Zeitzone anzeigen', () => {
		expect(formatDateTime(start, 'de', 'short', 'Asia/Tokyo')).toBe('21.09.2026, 03:00');
	});

	it('sollte Strings annehmen und bei fehlenden Werten leer bleiben', () => {
		expect(formatDateTime('2026-09-20T18:00:00.000Z', 'de')).toBe('20.09.2026, 20:00');
		expect(formatDateTime(null, 'de')).toBe('');
		expect(formatDateTime('kaputt', 'de')).toBe('');
	});
});
