import { type Actions, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { CurrentUser } from '$lib/models/user/CurrentUser';
import { UserService } from '$lib/services/user.service';
import { StandardResponse } from '$lib/models/transferData/StandardResponse';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { MIN_PASSWORD_LENGTH } from '$lib/constants';
import { validatePasswordChange } from '$lib/services/user.logic';
import { ACCOUNT_SCOPE, PASSWORD_SCOPE } from '$lib/models/transferData/StandardResponse';

export const actions: Actions = {
	/**
	 * POST /settings?/changePassword
	 *
	 * Ändert das Passwort des eingeloggten Nutzers.
	 *
	 * Formularfelder: currentPassword, password, passwordRepeat (string)
	 *
	 * Verlangt das aktuelle Passwort (eine gestohlene Session allein reicht nicht)
	 * und ein Wiederholungsfeld (Schutz vor Tippfehler-Aussperrung). Nach
	 * erfolgreicher Änderung wird das Session-Token rotiert, sodass eventuell
	 * mitgelesene Alt-Tokens ungültig werden.
	 *
	 * @returns { success: true, message: 'Password changed' } bei Erfolg,
	 *          { success: false, message } bei Fehler oder ungültigen Eingaben
	 */
	changePassword: async ({ cookies, request, locals }): Promise<StandardResponse> => {
		const user: CurrentUser | undefined = locals.currentUser;
		if (!user) {
			return { success: false, message: 'Password change failed', scope: PASSWORD_SCOPE };
		}
		const data: FormData = await request.formData();
		const currentPassword: string | undefined = data.get('currentPassword')?.toString();
		const password: string | undefined = data.get('password')?.toString();
		const passwordRepeat: string | undefined = data.get('passwordRepeat')?.toString();

		const validationError: string | null = validatePasswordChange(
			currentPassword,
			password,
			passwordRepeat,
			MIN_PASSWORD_LENGTH
		);
		if (validationError) {
			return { success: false, message: validationError, scope: PASSWORD_SCOPE };
		}

		if (!(await UserService.loginWithCredentials(user.nickname, currentPassword!))) {
			return { success: false, message: 'Current password is incorrect', scope: PASSWORD_SCOPE };
		}

		const result: ChangeResult = await UserService.updatePassword(user.id, password!);
		if (result === 'Success') {
			// Session-Token rotieren: Alt-Token wird in der DB ersetzt und verliert Gültigkeit.
			await UserService.createSession(cookies, locals, user);
			return { success: true, message: 'Password changed', scope: PASSWORD_SCOPE };
		}
		return { success: false, message: result, scope: PASSWORD_SCOPE };
	},

	/**
	 * POST /settings?/deleteAccount
	 *
	 * Löscht das Konto des eingeloggten Nutzers unwiderruflich (Art. 17 DSGVO).
	 *
	 * Formularfelder: deletePassword (string)
	 *
	 * Verlangt wie die Passwortänderung das aktuelle Passwort: Eine übernommene
	 * Session soll ein fremdes Konto nicht löschen können. Der Umfang der Löschung
	 * steckt in `UserService.deleteAccount`.
	 *
	 * @returns Redirect auf /login bei Erfolg (die Session existiert danach nicht mehr),
	 *          { success: false, message } bei falschem Passwort oder Fehler
	 */
	deleteAccount: async ({ cookies, request, locals }): Promise<StandardResponse> => {
		const user: CurrentUser | undefined = locals.currentUser;
		if (!user) {
			return { success: false, message: 'Account deletion failed', scope: ACCOUNT_SCOPE };
		}
		const data: FormData = await request.formData();
		const password: string | undefined = data.get('deletePassword')?.toString();

		if (!password) {
			return { success: false, message: 'Password is required to delete the account', scope: ACCOUNT_SCOPE };
		}
		if (!(await UserService.loginWithCredentials(user.nickname, password))) {
			return { success: false, message: 'Current password is incorrect', scope: ACCOUNT_SCOPE };
		}

		const result: ChangeResult = await UserService.deleteAccount(user.id);
		if (result !== 'Success') {
			return { success: false, message: result, scope: ACCOUNT_SCOPE };
		}

		// Der Session-Token ist mit dem Nutzer bereits kaskadiert gelöscht; logout()
		// räumt hier den Cookie und `locals` ab, damit der Redirect nicht mit einer
		// Session ins Leere zeigt.
		await UserService.logout(cookies, locals);
		redirect(303, resolve('/login'));
	}
};
