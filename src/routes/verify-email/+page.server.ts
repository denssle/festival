import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { t } from '$lib/i18n';
import { AccountMailService } from '$lib/services/account-mail.service';
import { UserService } from '$lib/services/user.service';
import { VERIFY_TOKEN_TTL_MS } from '$lib/services/mail-token.logic';
import type { StandardResponse } from '$lib/models/transferData/StandardResponse';

/**
 * load – GET /verify-email?token=…
 *
 * Löst den Bestätigungslink aus der Mail ein. Ohne Anmeldung erreichbar (siehe
 * `noAuthURLs` in hooks.server.ts): Der Link wird oft auf einem anderen Gerät geöffnet
 * als dem, auf dem man angemeldet ist, und das Token allein weist den Besitz der
 * Adresse nach.
 *
 * Bestätigt schon beim Aufruf (GET mit Wirkung). Unbedenklich, anders als beim
 * Passwort-Reset: Öffnet ein Mail-Scanner den Link vorab, bestätigt er nur, dass die
 * Mail angekommen ist – mehr gibt der Link nicht her.
 */
export const load: PageServerLoad = async ({ url }): Promise<{ verified: boolean | null }> => {
	const token: string | null = url.searchParams.get('token');
	if (!token) {
		return { verified: null };
	}
	return { verified: await AccountMailService.verifyEmail(token) };
};

export const actions: Actions = {
	/**
	 * POST /verify-email?/send
	 *
	 * Schickt (erneut) einen Bestätigungslink an die Adresse des angemeldeten Nutzers.
	 * Aufgerufen vom Knopf im eigenen Profil.
	 */
	send: async ({ locals, url }): Promise<StandardResponse> => {
		const user = locals.currentUser;
		if (!user) {
			redirect(303, resolve('/login'));
		}
		const result = await AccountMailService.sendEmailVerification(user.id, url.origin, locals.locale);
		switch (result) {
			case 'sent':
				return {
					success: true,
					message: t(locals.locale, 'verifyEmail.sent', {
						email: await UserService.getEmailById(user.id),
						hours: VERIFY_TOKEN_TTL_MS / (60 * 60 * 1000)
					})
				};
			case 'noEmail':
				return { success: false, message: t(locals.locale, 'verifyEmail.noEmail') };
			case 'rateLimited':
				return { success: false, message: t(locals.locale, 'verifyEmail.rateLimited') };
			case 'failed':
				return { success: false, message: t(locals.locale, 'verifyEmail.failed') };
		}
	}
};
