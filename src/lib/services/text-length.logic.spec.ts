import { describe, it, expect } from 'vitest';
import {
	countCharacters,
	findTooLongField,
	FESTIVAL_TEXT_LIMITS,
	GUEST_TEXT_LIMITS,
	MAX_LONG_TEXT_LENGTH,
	MAX_SHORT_TEXT_LENGTH
} from './text-length.logic';

describe('countCharacters', () => {
	it('sollte ASCII-Zeichen einzeln zählen', () => {
		expect(countCharacters('Festival')).toBe(8);
	});

	// MariaDB zählt bei VARCHAR(n) Codepoints, String.length dagegen UTF-16-Einheiten.
	it('sollte ein Emoji als ein Zeichen zählen', () => {
		expect('🎉'.length).toBe(2);
		expect(countCharacters('🎉')).toBe(1);
	});

	it('sollte Umlaute als ein Zeichen zählen', () => {
		expect(countCharacters('Grüße')).toBe(5);
	});
});

describe('findTooLongField', () => {
	it('sollte null liefern, wenn alle Felder genau auf der Grenze liegen', () => {
		expect(
			findTooLongField(
				{
					name: 'n'.repeat(MAX_SHORT_TEXT_LENGTH),
					location: 'l'.repeat(MAX_SHORT_TEXT_LENGTH),
					description: 'd'.repeat(MAX_LONG_TEXT_LENGTH)
				},
				FESTIVAL_TEXT_LIMITS
			)
		).toBeNull();
	});

	// Der eigentliche Fehler: 256 Zeichen im VARCHAR(255) → "Data too long" → 500 in Prod.
	it('sollte ein Kurzfeld mit einem Zeichen zu viel melden', () => {
		expect(findTooLongField({ name: 'n'.repeat(MAX_SHORT_TEXT_LENGTH + 1) }, FESTIVAL_TEXT_LIMITS)).toEqual({
			field: 'name',
			max: MAX_SHORT_TEXT_LENGTH
		});
	});

	it('sollte einen zu langen Freitext melden', () => {
		expect(findTooLongField({ description: 'd'.repeat(MAX_LONG_TEXT_LENGTH + 1) }, FESTIVAL_TEXT_LIMITS)).toEqual({
			field: 'description',
			max: MAX_LONG_TEXT_LENGTH
		});
	});

	it('sollte längere Texte in Freitextfeldern zulassen als in Kurzfeldern', () => {
		const text = 'x'.repeat(1000);
		expect(findTooLongField({ comment: text }, GUEST_TEXT_LIMITS)).toBeNull();
		expect(findTooLongField({ food: text }, GUEST_TEXT_LIMITS)).toEqual({ field: 'food', max: MAX_SHORT_TEXT_LENGTH });
	});

	it('sollte Emojis nicht doppelt zählen', () => {
		expect(findTooLongField({ name: '🎉'.repeat(MAX_SHORT_TEXT_LENGTH) }, FESTIVAL_TEXT_LIMITS)).toBeNull();
	});

	it('sollte fehlende Felder als gültig behandeln', () => {
		expect(findTooLongField({ name: null, description: undefined }, FESTIVAL_TEXT_LIMITS)).toBeNull();
		expect(findTooLongField({}, FESTIVAL_TEXT_LIMITS)).toBeNull();
	});

	// Aus einem JSON-Body kann statt eines Strings alles Mögliche kommen.
	it('sollte Nicht-String-Werte nicht an der Prüfung vorbeilassen', () => {
		const huge = ['x'.repeat(MAX_SHORT_TEXT_LENGTH + 1)];
		expect(findTooLongField({ drink: huge }, GUEST_TEXT_LIMITS)).toEqual({
			field: 'drink',
			max: MAX_SHORT_TEXT_LENGTH
		});
	});

	it('sollte Felder ohne definierte Grenze ignorieren', () => {
		expect(findTooLongField({ comment: 'ok', extra: 'x'.repeat(10_000) } as never, GUEST_TEXT_LIMITS)).toBeNull();
	});
});
