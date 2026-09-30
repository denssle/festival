import type { Actions, PageServerLoad } from './$types';
import { t } from '$lib/i18n';
import { MIN_PASSWORD_LENGTH } from '$lib/constants';
import { AccountMailService } from '$lib/services/account-mail.service';
import { MAX_PASSWORD_BYTES, readTextField } from '$lib/services/user.logic';
import type { StandardResponse } from '$lib/models/transferData/StandardResponse';

/**
 * load – GET /reset-password?token=…
 *
 * Prüft den Link nur, ohne ihn einzulösen: Mail-Scanner öffnen Links oft vorab, und das
 * darf den Link nicht verbrauchen. Eingelöst wird erst beim Absenden des Formulars.
 */
export const load: PageServerLoad = async ({ url }): Promise<{ token: string; valid: boolean }> => {
	const token: string = url.searchParams.get('token') ?? '';
	return { token, valid: await AccountMailService.isResetTokenValid(token) };
};

export const actions: Actions = {
	/**
	 * POST /reset-password
	 *
	 * Formularfelder: token (versteckt), password, passwordRepeat
	 */
	default: async ({ request, locals }): Promise<StandardResponse> => {
		const data: FormData = await request.formData();
		const token: string = readTextField(data, 'token');
		const password: string = readTextField(data, 'password');
		const passwordRepeat: string = readTextField(data, 'passwordRepeat');

		if (!password || !passwordRepeat) {
			return { success: false, message: t(locals.locale, 'auth.error.newPasswordRequired') };
		}
		if (password !== passwordRepeat) {
			return { success: false, message: t(locals.locale, 'auth.error.passwordsDoNotMatch') };
		}
		const result = await AccountMailService.resetPassword(token, password);
		if (result.ok) {
			// Die Sitzung dieses Browsers ist mit allen anderen beendet – das Cookie verweist ins Leere.
			locals.currentUser = undefined;
			return { success: true, message: t(locals.locale, 'resetPassword.success') };
		}
		if (result.error === 'invalidToken') {
			return { success: false, message: t(locals.locale, 'resetPassword.invalid') };
		}
		return {
			success: false,
			message: t(locals.locale, result.error, { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_BYTES })
		};
	}
};
