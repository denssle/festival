import type { Actions, Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { UserService } from '$lib/services/user.service';
import type { BackendUser } from '$lib/models/user/BackendUser';
import { StandardResponse } from '$lib/models/transferData/StandardResponse';
import { NickPassData } from '$lib/models/transferData/NickPassData';
import { loginRateLimiter } from '$lib/services/login-rate-limit';
import { loginRateLimitKey } from '$lib/services/rate-limit.logic';

/**
 * load – GET /login
 *
 * Prüft ob der Nutzer bereits eingeloggt ist.
 * Leitet bei gültiger Session auf die Startseite weiter.
 *
 * @param cookies - Session-Cookie zur Validierung
 * @returns { success: true } wenn kein aktiver Login vorhanden
 */
export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }): Promise<StandardResponse> => {
	const valid: boolean = await UserService.validateSessionToken(cookies.get('session'));
	if (valid) {
		redirect(303, '/');
	}
	return { success: true };
};

/**
 * actions.default – POST /login
 *
 * Verarbeitet das Login-Formular mit Nickname und Passwort.
 * Legt bei Erfolg einen Session-Cookie an und leitet auf die Startseite weiter.
 *
 * Formularfelder: nickname (string), password (string)
 *
 * Brute-Force-Schutz: Nach zu vielen Fehlversuchen (pro IP+Nickname) wird der
 * Login temporär gesperrt, ohne das Passwort überhaupt zu prüfen.
 *
 * @returns { success: false, message } bei ungültigen Daten, falschem Passwort
 *          oder aktiver Sperre
 */
export const actions: Actions = {
	default: async ({ cookies, request, locals, getClientAddress }): Promise<StandardResponse> => {
		const formData: NickPassData | undefined = await UserService.readNickPass(request.formData());
		if (formData) {
			const rateLimitKey: string = loginRateLimitKey(getClientAddress(), formData.nickname);
			if (loginRateLimiter.isBlocked(rateLimitKey)) {
				return { success: false, message: 'Too many failed login attempts. Please try again later.' };
			}
			const user: BackendUser | null = await UserService.loginWithCredentials(formData.nickname, formData.password);
			if (user) {
				loginRateLimiter.reset(rateLimitKey);
				await UserService.createSessionCookie(cookies, locals, user, true);
				redirect(302, '/');
			} else {
				loginRateLimiter.recordFailure(rateLimitKey);
				return { success: false, message: 'Password invalid' };
			}
		}
		return { success: false, message: 'Password and / or Nickname missing' };
	}
};
