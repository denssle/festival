import type { RequestHandler } from './$types';
import { base } from '$app/paths';
import { dev } from '$app/environment';
import { isLocale, safeRedirectTarget } from '$lib/i18n';
import { LANGUAGE_COOKIE_MAX_AGE_SECONDS, LANGUAGE_COOKIE_NAME, SESSION_COOKIE_PATH } from '$lib/constants';

/**
 * POST /language
 *
 * Setzt den Sprach-Cookie und schickt den Nutzer auf die Seite zurück, von der er kam.
 * Bewusst ein Formular-POST und kein Client-Fetch: So funktioniert der Umschalter auch
 * ohne JavaScript, und die neue Sprache steht schon im ersten gerenderten HTML.
 *
 * @returns 303 zurück auf die Ausgangsseite (bei ungültigen Eingaben auf die Startseite)
 */
export const POST: RequestHandler = async ({ request, cookies }): Promise<Response> => {
	const formData: FormData = await request.formData();
	const gewuenscht: FormDataEntryValue | null = formData.get('locale');
	const locale: string | null = typeof gewuenscht === 'string' ? gewuenscht : null;

	if (isLocale(locale)) {
		cookies.set(LANGUAGE_COOKIE_NAME, locale, {
			path: SESSION_COOKIE_PATH,
			maxAge: LANGUAGE_COOKIE_MAX_AGE_SECONDS,
			httpOnly: true,
			// 'lax' statt 'strict' wie beim Session-Cookie: Die Sprache soll auch dann
			// stehen, wenn jemand von aussen auf einen geteilten Festival-Link klickt.
			sameSite: 'lax',
			// Secure an den Build-Modus koppeln – gleiche Begründung wie beim
			// Session-Cookie in `user.service.ts`: lokal/E2E läuft über http://localhost.
			secure: !dev
		});
	}

	const redirectTo: FormDataEntryValue | null = formData.get('redirectTo');
	const ziel: string = safeRedirectTarget(typeof redirectTo === 'string' ? redirectTo : null, base);

	// `${base}/…` statt resolve(): Ein Location-Header braucht den absoluten Pfad,
	// resolve() liefert einen relativen (siehe CLAUDE.md, Abschnitt 3).
	return new Response(null, { status: 303, headers: { Location: ziel } });
};
