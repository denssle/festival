import { type Actions } from '@sveltejs/kit';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { UserService } from '$lib/services/user.service';
import { StandardResponse } from '$lib/models/transferData/StandardResponse';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { MIN_PASSWORD_LENGTH } from '$lib/constants';
import { validatePasswordChange } from '$lib/services/user.logic';

/**
 * actions.default – POST /settings
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
export const actions: Actions = {
	default: async ({ cookies, request, locals }): Promise<StandardResponse> => {
		const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
		if (!user) {
			return { success: false, message: 'Password change failed' };
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
			return { success: false, message: validationError };
		}

		if (!(await UserService.loginWithCredentials(user.nickname, currentPassword!))) {
			return { success: false, message: 'Current password is incorrect' };
		}

		const result: ChangeResult = await UserService.updatePassword(user, password!);
		if (result === 'Success') {
			// Session-Token rotieren: Alt-Token wird in der DB ersetzt und verliert Gültigkeit.
			await UserService.createSessionCookie(cookies, locals, user, true);
			return { success: true, message: 'Password changed' };
		}
		return { success: false, message: result };
	}
};
