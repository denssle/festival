import type { Actions, Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import { UserService } from '$lib/services/user.service';
import { StandardResponse } from '$lib/models/transferData/StandardResponse';
import { BackendUser } from '$lib/models/user/BackendUser';
import { NickPassData } from '$lib/models/transferData/NickPassData';

/**
 * load – GET /registration
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
			if (await UserService.nickNameInvalid(formData.nickname)) {
				return { success: false, message: 'Invalid Nickname' };
			} else {
				const user: BackendUser | null = await UserService.register(formData.nickname, formData.password);
				if (user) {
					await UserService.createSessionCookie(cookies, locals, user, true);
					redirect(302, '/');
				} else {
					return { success: false, message: 'User creation failed' };
				}
			}
		}
		return { success: false, message: 'Password and / or Nickname missing' };
	}
};
