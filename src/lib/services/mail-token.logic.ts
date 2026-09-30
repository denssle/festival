import { createHash, randomBytes } from 'node:crypto';

/** Reset-Links sind kurzlebig: Wer ein Postfach kurz übernimmt, soll nicht tagelang Zeit haben. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 Stunde
/** Bestätigungslinks dürfen länger liegen – sie geben keinen Zugang zum Konto. */
export const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 Stunden

/**
 * Erzeugt ein Token für einen Link in einer Mail samt dem Hash, der in der DB landet.
 * 32 Zufallsbytes, URL-tauglich kodiert.
 */
export function generateMailToken(): { token: string; tokenHash: string } {
	const token: string = randomBytes(32).toString('base64url');
	return { token, tokenHash: hashMailToken(token) };
}

/**
 * SHA-256 statt bcrypt: Das Token ist ein langer Zufallswert, kein Passwort – es gibt
 * nichts zu erraten, das ein langsamer Hash schützen müsste. So bleibt der Hash zugleich
 * als eindeutiger Suchschlüssel nutzbar.
 */
export function hashMailToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function isMailTokenExpired(expiresAt: Date, now: Date = new Date()): boolean {
	return Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime();
}
