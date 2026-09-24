/**
 * Längengrenzen für Texteingaben.
 *
 * Hintergrund: `DataTypes.STRING` ist in MariaDB ein VARCHAR(255) und lehnt (im
 * Strict-Mode) längere Werte mit "Data too long" ab. SQLite (Dev/Tests) kennt diese
 * Grenze nicht – ein 500-Zeichen-Wert ging lokal durch und endete in Produktion als
 * unbehandelter Sequelize-Fehler, also als 500. Die Prüfung sitzt deshalb vor der DB,
 * damit beide Dialekte gleich reagieren.
 *
 * Echter Freitext (Kommentare, Beschreibungen) liegt seit Migration 0002 in TEXT-Spalten
 * (65.535 Bytes). Die Grenze dafür ist bewusst deutlich kleiner: 5.000 Zeichen à maximal
 * 4 Bytes (utf8mb4) passen sicher hinein.
 */

/** Grenze einer VARCHAR(255)-Spalte (`DataTypes.STRING`). */
export const MAX_SHORT_TEXT_LENGTH = 255;

/** Grenze für Freitext in TEXT-Spalten (`DataTypes.TEXT`). */
export const MAX_LONG_TEXT_LENGTH = 5000;

export const FESTIVAL_TEXT_LIMITS = {
	name: MAX_SHORT_TEXT_LENGTH,
	location: MAX_SHORT_TEXT_LENGTH,
	description: MAX_LONG_TEXT_LENGTH
} as const;

export const GROUP_TEXT_LIMITS = {
	name: MAX_SHORT_TEXT_LENGTH,
	description: MAX_LONG_TEXT_LENGTH
} as const;

export const COMMENT_TEXT_LIMITS = {
	comment: MAX_LONG_TEXT_LENGTH
} as const;

export const GUEST_TEXT_LIMITS = {
	food: MAX_SHORT_TEXT_LENGTH,
	drink: MAX_SHORT_TEXT_LENGTH,
	comment: MAX_LONG_TEXT_LENGTH
} as const;

export const USER_TEXT_LIMITS = {
	nickname: MAX_SHORT_TEXT_LENGTH,
	forename: MAX_SHORT_TEXT_LENGTH,
	lastname: MAX_SHORT_TEXT_LENGTH,
	email: MAX_SHORT_TEXT_LENGTH
} as const;

/** Ein Feld, das seine Grenze überschreitet. */
export interface TooLongField<K extends string> {
	field: K;
	max: number;
}

/**
 * Zählt Zeichen so, wie MariaDB es bei VARCHAR(n) tut: nach Unicode-Codepoints.
 * `String.length` zählt UTF-16-Einheiten – ein Emoji wären dort zwei Zeichen, und
 * Texte mit vielen Emojis würden zu früh abgelehnt.
 */
export function countCharacters(value: string): number {
	return Array.from(value).length;
}

/**
 * Sucht das erste Feld, das seine Längengrenze überschreitet.
 *
 * Fehlende Werte (`null`/`undefined`) gelten als leer und damit als gültig – ob ein
 * Feld Pflicht ist, prüft der Aufrufer separat. Nicht-String-Werte (etwa aus einem
 * manipulierten JSON-Body) werden über `String()` gemessen, damit sie die Prüfung nicht
 * einfach umgehen.
 *
 * @param values - Die zu prüfenden Eingaben
 * @param limits - Maximale Zeichenzahl je Feld (z. B. `FESTIVAL_TEXT_LIMITS`)
 * @returns Das erste zu lange Feld samt Grenze, oder null, wenn alles passt
 */
export function findTooLongField<K extends string>(
	values: Partial<Record<K, unknown>>,
	limits: Record<K, number>
): TooLongField<K> | null {
	for (const field of Object.keys(limits) as K[]) {
		const value = values[field];
		if (value === null || value === undefined) {
			continue;
		}
		const max = limits[field];
		if (countCharacters(typeof value === 'string' ? value : String(value)) > max) {
			return { field, max };
		}
	}
	return null;
}
