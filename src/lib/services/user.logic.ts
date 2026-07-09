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
