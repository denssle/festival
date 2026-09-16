import { describe, expect, it } from 'vitest';
import { de } from './de';
import { en } from './en';
import {
	DEFAULT_LOCALE,
	interpolate,
	isLocale,
	LOCALES,
	negotiateLocale,
	resolveLocale,
	safeRedirectTarget
} from './locale.logic';

describe('isLocale', () => {
	it('sollte unterstützte Sprachen erkennen', () => {
		expect(isLocale('de')).toBe(true);
		expect(isLocale('en')).toBe(true);
	});

	it('sollte alles andere ablehnen', () => {
		expect(isLocale('fr')).toBe(false);
		expect(isLocale('DE')).toBe(false);
		expect(isLocale('')).toBe(false);
		expect(isLocale(undefined)).toBe(false);
		expect(isLocale(null)).toBe(false);
	});
});

describe('negotiateLocale', () => {
	it('sollte ohne Header nichts liefern', () => {
		expect(negotiateLocale(null)).toBeNull();
		expect(negotiateLocale('')).toBeNull();
	});

	it('sollte regionale Tags auf die Basissprache reduzieren', () => {
		expect(negotiateLocale('en-GB')).toBe('en');
		expect(negotiateLocale('de-AT')).toBe('de');
	});

	it('sollte den höchsten q-Wert gewinnen lassen, nicht den ersten Eintrag', () => {
		// Der Header ist bewusst gegen die Präferenz sortiert: 'de' steht vorne,
		// hat aber den niedrigeren q-Wert.
		expect(negotiateLocale('de;q=0.5,en;q=0.9')).toBe('en');
	});

	it('sollte fehlendes q als 1 werten', () => {
		expect(negotiateLocale('en,de;q=0.9')).toBe('en');
	});

	it('sollte nicht unterstützte Sprachen überspringen', () => {
		expect(negotiateLocale('fr-FR,fr;q=0.9,de;q=0.8')).toBe('de');
	});

	it('sollte q=0 als ausdrückliche Ablehnung behandeln', () => {
		expect(negotiateLocale('de;q=0')).toBeNull();
		expect(negotiateLocale('de;q=0,en;q=0.5')).toBe('en');
	});

	it('sollte bei kaputten Headern nichts liefern statt zu werfen', () => {
		expect(negotiateLocale('de;q=abc')).toBeNull();
		expect(negotiateLocale(',,,')).toBeNull();
		expect(negotiateLocale('*')).toBeNull();
	});
});

describe('resolveLocale', () => {
	it('sollte den Cookie über den Browser stellen', () => {
		expect(resolveLocale('en', 'de')).toBe('en');
	});

	it('sollte bei ungültigem Cookie auf den Header zurückfallen', () => {
		expect(resolveLocale('klingonisch', 'en')).toBe('en');
	});

	it('sollte ohne beides den Standard liefern', () => {
		expect(resolveLocale(undefined, null)).toBe(DEFAULT_LOCALE);
	});
});

describe('interpolate', () => {
	it('sollte Platzhalter ersetzen', () => {
		expect(interpolate('Organisiert von {nickname}', { nickname: 'Dominik' })).toBe('Organisiert von Dominik');
	});

	it('sollte Zahlen verarbeiten', () => {
		expect(interpolate('{count} Gäste', { count: 3 })).toBe('3 Gäste');
	});

	it('sollte unbekannte Platzhalter sichtbar stehen lassen', () => {
		// Absicht: Ein sichtbares {fehlt} zeigt den Fehler, ein Leerstring versteckt ihn.
		expect(interpolate('Hallo {fehlt}', { name: 'x' })).toBe('Hallo {fehlt}');
	});

	it('sollte ohne Parameter unverändert durchreichen', () => {
		expect(interpolate('Nichts zu tun')).toBe('Nichts zu tun');
	});
});

describe('safeRedirectTarget', () => {
	const base = '/festival';

	it('sollte Pfade innerhalb der App durchlassen', () => {
		expect(safeRedirectTarget('/festival/settings', base)).toBe('/festival/settings');
		expect(safeRedirectTarget('/festival/festival/abc?tab=gaeste', base)).toBe('/festival/festival/abc?tab=gaeste');
	});

	it('sollte ohne Wert auf die Startseite fallen', () => {
		expect(safeRedirectTarget(null, base)).toBe('/festival/');
		expect(safeRedirectTarget('', base)).toBe('/festival/');
		expect(safeRedirectTarget(undefined, base)).toBe('/festival/');
	});

	it('sollte fremde Hosts abweisen', () => {
		expect(safeRedirectTarget('https://example.com', base)).toBe('/festival/');
		expect(safeRedirectTarget('//example.com', base)).toBe('/festival/');
		expect(safeRedirectTarget('/\\example.com', base)).toBe('/festival/');
	});

	it('sollte Pfade ausserhalb des Base-Pfads abweisen', () => {
		// Die Domain-Wurzel gehört einem anderen Projekt (siehe CLAUDE.md, Abschnitt 3).
		expect(safeRedirectTarget('/wp-admin', base)).toBe('/festival/');
		expect(safeRedirectTarget('/festivalfremd/seite', base)).toBe('/festival/');
	});

	it('sollte auch ohne Base-Pfad keine fremden Hosts durchlassen', () => {
		// Ohne base ist die Startseite nur '/', die Prüfung auf '//' trägt hier allein.
		expect(safeRedirectTarget('//example.com', '')).toBe('/');
		expect(safeRedirectTarget('/\\example.com', '')).toBe('/');
		expect(safeRedirectTarget('/settings', '')).toBe('/settings');
	});
});

describe('Wörterbücher', () => {
	// Diese Prüfung macht TypeScript bereits (en.ts ist auf `Dictionary` typisiert).
	// Der Test ist die Gegenprobe zur Laufzeit – und schlägt auch dann an, wenn jemand
	// die Typannotation in en.ts durch `as const` ersetzt.
	it('sollten in allen Sprachen dieselben Schlüssel haben', () => {
		const deKeys: string[] = Object.keys(de).sort();
		const enKeys: string[] = Object.keys(en).sort();
		expect(enKeys).toEqual(deKeys);
	});

	it('sollten keine leeren Übersetzungen enthalten', () => {
		for (const [locale, dictionary] of [
			['de', de],
			['en', en]
		] as const) {
			for (const [key, value] of Object.entries(dictionary)) {
				expect(value.trim(), `${locale}: ${key} ist leer`).not.toBe('');
			}
		}
	});

	it('sollte für jede Sprache aus LOCALES einen Namen im Umschalter haben', () => {
		for (const locale of LOCALES) {
			expect(Object.keys(de)).toContain(`language.${locale}`);
		}
	});
});
