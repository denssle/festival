import type { TranslationKey } from '$lib/i18n';
import { COMMON_PASSWORDS } from './common-passwords';

/**
 * bcrypt wertet nur die ersten 72 Bytes eines Passworts aus, alles dahinter wird
 * stillschweigend ignoriert. Längere Passwörter lehnen wir deshalb ab, statt so zu tun,
 * als zählte jedes Zeichen.
 */
export const MAX_PASSWORD_BYTES = 72;

/**
 * Liest ein Formularfeld als Text.
 *
 * `FormData.get()` liefert `null`, wenn das Feld gar nicht gesendet wurde, und ein
 * `File`-Objekt bei Datei-Uploads. Ein `String(...)` darüber erzeugt daraus die Texte
 * `"null"` bzw. `"[object File]"` – die dann als E-Mail oder Nachname in der Datenbank
 * landen. Fehlende Felder ergeben hier stattdessen einen leeren String.
 *
 * @param values - Die Formulardaten des Requests
 * @param field - Name des Feldes
 * @returns Der Textwert, oder '' wenn das Feld fehlt oder kein Text ist
 */
export function readTextField(values: FormData, field: string): string {
	const value: FormDataEntryValue | null = values.get(field);
	return typeof value === 'string' ? value : '';
}

/**
 * Passwortregeln für jedes neu gesetzte Passwort (Registrierung, Änderung, Reset).
 *
 * Nach NIST SP 800-63B zählt die Länge, nicht die Zusammensetzung (entschieden
 * 2026-09-30): keine Pflicht zu Ziffern oder Sonderzeichen, die führt nur zu Mustern
 * wie „Passwort1!“. Stattdessen gesperrt: zu kurz, länger als bcrypt auswertet, der
 * eigene Nickname und die verbreitetsten Passwörter. Bestehende Passwörter bleiben
 * gültig – die Regeln greifen erst beim nächsten Setzen.
 *
 * Der Aufrufer übersetzt mit `t()` und den Parametern `{ min, max: MAX_PASSWORD_BYTES }`.
 *
 * @returns Übersetzungsschlüssel oder null, wenn das Passwort die Regeln erfüllt
 */
export function validateNewPassword(password: string, nickname: string, minLength: number): TranslationKey | null {
	if (password.length < minLength) {
		return 'auth.error.passwordTooShort';
	}
	if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
		return 'auth.error.passwordTooLong';
	}
	const normalized: string = password.trim().toLowerCase();
	if (normalized === nickname.trim().toLowerCase()) {
		return 'auth.error.passwordEqualsNickname';
	}
	if (COMMON_PASSWORDS.has(normalized)) {
		return 'auth.error.passwordTooCommon';
	}
	return null;
}

/**
 * Validiert die Eingaben einer Passwortänderung (reine Formprüfung, kein DB-Zugriff).
 *
 * Prüft, dass alle Felder vorhanden sind, das neue Passwort die Regeln aus
 * `validateNewPassword` erfüllt und die Wiederholung übereinstimmt (Schutz vor
 * Tippfehler-Aussperrung).
 * Ob das aktuelle Passwort stimmt, prüft der Aufrufer gegen die DB.
 *
 * Liefert einen Übersetzungsschlüssel statt eines fertigen Textes: Diese Datei ist reine
 * Logik ohne Kenntnis der gewählten Sprache, und vorher wanderten die englischen Texte
 * von hier unverändert in eine deutsche Oberfläche. Der Aufrufer übersetzt mit `t()` und
 * reicht dabei die Parameter durch (`{min}`, `{max}`, siehe `validateNewPassword`).
 *
 * @returns Übersetzungsschlüssel oder null, wenn die Eingaben formal gültig sind
 */
export function validatePasswordChange(
	currentPassword: string | undefined,
	newPassword: string | undefined,
	newPasswordRepeat: string | undefined,
	nickname: string,
	minLength: number
): TranslationKey | null {
	if (!currentPassword) {
		return 'auth.error.currentPasswordRequired';
	}
	if (!newPassword || !newPasswordRepeat) {
		return 'auth.error.newPasswordRequired';
	}
	const ruleViolation: TranslationKey | null = validateNewPassword(newPassword, nickname, minLength);
	if (ruleViolation) {
		return ruleViolation;
	}
	if (newPassword !== newPasswordRepeat) {
		return 'auth.error.passwordsDoNotMatch';
	}
	return null;
}

/**
 * Prüft, ob ein Session-Token seine absolute Lebensdauer überschritten hat.
 *
 * Grundlage ist der Ausstellungszeitpunkt des Tokens (`updatedAt` der
 * SessionToken-Zeile). Da bei normaler Session-Validierung kein DB-Upsert
 * erfolgt, bleibt dieser Zeitstempel stabil auf dem Login-Zeitpunkt und
 * eignet sich daher als absolute (nicht gleitende) Ablaufgrenze.
 *
 * @param issuedAt - Zeitpunkt, zu dem der Token ausgestellt wurde
 * @param maxAgeMs - Maximale Lebensdauer in Millisekunden
 * @param now - Aktueller Zeitpunkt (default: jetzt), injizierbar für Tests
 * @returns true, wenn der Token abgelaufen ist
 */
export function isSessionTokenExpired(issuedAt: Date | undefined, maxAgeMs: number, now: Date = new Date()): boolean {
	if (!issuedAt) {
		return true;
	}
	const issuedMs: number = issuedAt.getTime();
	if (Number.isNaN(issuedMs)) {
		return true;
	}
	return now.getTime() - issuedMs > maxAgeMs;
}
