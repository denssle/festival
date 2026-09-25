import type { Optional } from 'sequelize';

/**
 * Ein Kommentar hängt entweder an einem Festival ODER an einem Nutzerprofil – genau
 * eine der beiden Spalten ist gesetzt (Modell-Validator `exactlyOneTarget`, in MariaDB
 * zusätzlich ein CHECK-Constraint aus Migration 0003).
 *
 * Bis v0.7.59 stand beides in EINER polymorphen Spalte `writtenTo`. Die konnte keinen FK
 * haben, also räumte die DB beim Löschen eines Ziels nichts ab, und Kommentare an nicht
 * existierende IDs ließen sich anlegen. Jetzt übernimmt beides die FK-Kaskade.
 */
export interface CommentAttributes {
	id: string;
	writtenBy: string;
	FestivalEventId: string | null;
	ProfileUserId: string | null;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
}

/** Attribute beim Anlegen: Pflicht sind `id` und `writtenBy`, dazu genau eines der Ziele. */
export type CommentCreationAttributes = Optional<
	CommentAttributes,
	'createdAt' | 'updatedAt' | 'comment' | 'FestivalEventId' | 'ProfileUserId'
>;
