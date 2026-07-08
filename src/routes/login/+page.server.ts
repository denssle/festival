import type { Actions, Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { UserService } from '$lib/services/user.service';
import type { BackendUser } from '$lib/models/user/BackendUser';
import { StandardResponse } from '$lib/models/transferData/StandardResponse';
import { NickPassData } from '$lib/models/transferData/NickPassData';

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
 * @returns { success: false, message } bei ungültigen Daten oder falschem Passwort
 */
export const actions: Actions = {
	default: async ({
		cookies,
		request,
		locals
	}: {
		cookies: Cookies;
		request: Request;
		locals: App.Locals;
	}): Promise<StandardResponse> => {
		const formData: NickPassData | undefined = await UserService.readNickPass(request.formData());
		if (formData) {
			const user: BackendUser | null = await UserService.loginWithCredentials(formData.nickname, formData.password);
			if (user) {
				await UserService.createSessionCookie(cookies, locals, user, true);
				redirect(302, '/');
			} else {
				return { success: false, message: 'Password invalid' };
			}
		}
		return { success: false, message: 'Password and / or Nickname missing' };
	}
};
