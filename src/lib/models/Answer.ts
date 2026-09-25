/**
 * Dreiwertige Antwort: dabei, vielleicht, nicht dabei.
 *
 * Heute für die Zu- und Absage bei Festivals (`guestInformations.answer`, Migration 0004).
 * Bewusst allgemein gehalten: Die geplante Terminabstimmung (TODO.md) antwortet je Termin
 * ebenfalls mit Ja / Vielleicht / Nein und soll denselben Typ verwenden.
 */
export const ANSWERS = ['yes', 'maybe', 'no'] as const;

export type Answer = (typeof ANSWERS)[number];

/** Antworten, die mit einem Kommentar statt mit Mitbring-Angaben gegeben werden. */
export type CommentAnswer = Exclude<Answer, 'yes'>;

export function isAnswer(value: unknown): value is Answer {
	return typeof value === 'string' && (ANSWERS as readonly string[]).includes(value);
}
