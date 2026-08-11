import type { Actions, Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { UserService } from '$lib/services/user.service';
import { StandardResponse } from '$lib/models/transferData/StandardResponse';
import { BackendUser } from '$lib/models/user/BackendUser';
import { NickPassData } from '$lib/models/transferData/NickPassData';
import { MIN_PASSWORD_LENGTH } from '$lib/constants';
import { resolve } from '$app/paths';

/**
 * load – GET /registration
 *
 * Prüft ob der Nutzer bereits eingeloggt ist (Session hat der Auth-Hook
 * bereits validiert und in locals abgelegt).
 * Leitet bei gültiger Session auf die Startseite weiter.
 *
 * @returns { success: true } wenn kein aktiver Login vorhanden
 */
export const load: PageServerLoad = async ({ locals }): Promise<StandardResponse> => {
	if (locals.currentUser) {
		redirect(303, resolve('/'));
	}
	return { success: true };
};

/**
 * actions.default – POST /registration
 *
 * Verarbeitet das Registrierungsformular mit Nickname und Passwort.
 * Prüft ob der Nickname bereits vergeben ist, legt den Nutzer an
 * und erstellt bei Erfolg einen Session-Cookie.
 *
 * Formularfelder: nickname (string), password (string)
 *
 * @returns { success: false, message } bei ungültigem Nickname, Duplikat oder Fehler
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
			if (formData.password.length < MIN_PASSWORD_LENGTH) {
				return { success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` };
			}
			if (await UserService.nickNameInvalid(formData.nickname)) {
				return { success: false, message: 'Invalid Nickname' };
			} else {
				const user: BackendUser | null = await UserService.register(formData.nickname, formData.password);
				if (user) {
					await UserService.createSession(cookies, locals, user);
					redirect(302, resolve('/'));
				} else {
					return { success: false, message: 'User creation failed' };
				}
			}
		}
		return { success: false, message: 'Password and / or Nickname missing' };
	}
};
