import { Handle } from '@sveltejs/kit';
import { UserService } from '$lib/services/user.service';
import { startDB } from '$lib/db/db';
import { CurrentUser } from '$lib/models/user/CurrentUser';

await startDB();

const noAuthURLs: string[] = ['/login', '/registration', '/about', '/impressum'];

export const handle: Handle = async ({ event, resolve }): Promise<Response> => {
	const pathname: string = event.url.pathname;

	if (pathname.startsWith('/_app/') || pathname.startsWith('/favicon')) {
		return resolve(event);
	}

	// Der Cookie enthält nur einen opaken Zufalls-Token; die Identität kommt aus der DB.
	const sessionToken: string | undefined = event.cookies.get('session');
	const currentUser: CurrentUser | null = await UserService.getCurrentUserBySessionToken(sessionToken);

	if (currentUser) {
		event.locals.currentUser = currentUser;
	} else {
		event.locals.currentUser = undefined;
		if (sessionToken) {
			// Ungültiger/abgelaufener Token: Cookie aufräumen (DB-Cleanup übernimmt
			// getCurrentUserBySessionToken bei Ablauf selbst)
			event.cookies.delete('session', { path: '/' });
		}
	}

	if (noAuthURLs.includes(pathname) || currentUser) {
		return resolve(event);
	} else {
		return new Response('Redirect', { status: 303, headers: { Location: '/login' } });
	}
};
