import type { Actions } from './$types';
import { t } from '$lib/i18n';
import { AccountMailService } from '$lib/services/account-mail.service';
import { LoginRateLimiter } from '$lib/services/rate-limit.logic';
import { readTextField } from '$lib/services/user.logic';
import type { StandardResponse } from '$lib/models/transferData/StandardResponse';

/**
 * Höchstens zehn Anfragen pro IP und Stunde. Der Limiter pro Konto im Service schützt das
 * Postfach; dieser hier bremst das massenhafte Durchprobieren von Nicknames und Adressen.
 */
const requestLimiter = new LoginRateLimiter({ maxAttempts: 10, windowMs: 60 * 60 * 1000 });

export const actions: Actions = {
	/**
	 * POST /forgot-password
	 *
	 * Formularfeld: identifier (Nickname oder E-Mail-Adresse)
	 *
	 * Antwortet immer gleich, ob es das Konto gibt oder nicht (siehe
	 * `AccountMailService.requestPasswordReset`). Der Versand läuft ohne `await`, damit auch
	 * die Antwortzeit nichts verrät.
	 */
	default: async ({ request, locals, url, getClientAddress }): Promise<StandardResponse> => {
		const ip: string = getClientAddress();
		if (requestLimiter.isBlocked(ip)) {
			return { success: false, message: t(locals.locale, 'forgotPassword.rateLimited') };
		}
		requestLimiter.recordFailure(ip);

		const identifier: string = readTextField(await request.formData(), 'identifier');
		void AccountMailService.requestPasswordReset(identifier, url.origin, locals.locale);
		return { success: true, message: t(locals.locale, 'forgotPassword.sent') };
	}
};
