import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { BackendUser } from '$lib/models/user/BackendUser';

/**
 * Bestimmt den zu verwendenden Session-Token.
 *
 * - Bei forceNewToken=true wird immer ein neuer Token generiert (Login/Registrierung).
 * - Andernfalls wird der bestehende Token aus dem Cookie wiederverwendet,
 *   um Race Conditions bei parallelen Requests zu vermeiden.
 *
 * @param user - BackendUser (kein Token) oder SessionTokenUser (hat Token)
 * @param forceNewToken - true beim Login/Registrierung, false bei normaler Session-Validierung
 * @param generateToken - Funktion zur Token-Generierung (default: crypto.randomUUID)
 * @returns [token, needsDbUpsert]
 */
export function resolveSessionToken(
	user: BackendUser | SessionTokenUser,
	forceNewToken: boolean,
	generateToken: () => string = () => crypto.randomUUID()
): [string, boolean] {
	const existingToken: string | undefined = 'token' in user ? (user as SessionTokenUser).token : undefined;
	const needsNewToken: boolean = forceNewToken || !existingToken;
	const token: string = needsNewToken ? generateToken() : existingToken!;
	return [token, needsNewToken];
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
/**
 * Validiert die Eingaben einer Passwortänderung (reine Formprüfung, kein DB-Zugriff).
 *
 * Prüft, dass alle Felder vorhanden sind, das neue Passwort die Mindestlänge
 * erfüllt und die Wiederholung übereinstimmt (Schutz vor Tippfehler-Aussperrung).
 * Ob das aktuelle Passwort stimmt, prüft der Aufrufer gegen die DB.
 *
 * @returns Fehlermeldung oder null, wenn die Eingaben formal gültig sind
 */
export function validatePasswordChange(
	currentPassword: string | undefined,
	newPassword: string | undefined,
	newPasswordRepeat: string | undefined,
	minLength: number
): string | null {
	if (!currentPassword) {
		return 'Current password is required';
	}
	if (!newPassword || !newPasswordRepeat) {
		return 'New password and repetition are required';
	}
	if (newPassword.length < minLength) {
		return `Password must be at least ${minLength} characters long`;
	}
	if (newPassword !== newPasswordRepeat) {
		return 'Passwords do not match';
	}
	return null;
}

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
