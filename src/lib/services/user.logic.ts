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
