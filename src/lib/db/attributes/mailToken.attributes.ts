import type { Optional } from 'sequelize';

/** Wofür ein per Mail verschickter Link gilt. */
export type MailTokenPurpose = 'verifyEmail' | 'resetPassword';

export const MAIL_TOKEN_PURPOSES: readonly MailTokenPurpose[] = ['verifyEmail', 'resetPassword'];

/**
 * Ein einmaliger Link aus einer Mail (Adressbestätigung oder Passwort-Reset).
 *
 * Gespeichert wird nur der SHA-256-Hash des Tokens, nie das Token selbst: Wer die
 * Datenbank (oder ein Backup davon) liest, kann damit keine offenen Links einlösen.
 */
export interface MailTokenAttributes {
	id: string;
	UserId: string;
	purpose: MailTokenPurpose;
	tokenHash: string;
	/**
	 * Bei `verifyEmail` die Adresse, die der Link bestätigt. Ändert der Nutzer seine
	 * Adresse zwischendurch, passt sie nicht mehr und der Link bestätigt nichts.
	 */
	email: string | null;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

/** Attribute beim Anlegen: Zeitstempel setzt Sequelize, `email` ist nullable. */
export type MailTokenCreationAttributes = Optional<MailTokenAttributes, 'createdAt' | 'updatedAt' | 'email'>;
