import { Handle } from '@sveltejs/kit';
import { UserService } from '$lib/services/user.service';
import { startDB } from '$lib/db/db';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';

startDB();

const noAuthURLs: string[] = ['/login', '/registration', '/about', '/impressum'];

export const handle: Handle = async ({ event, resolve }): Promise<Response> => {
	const pathname: string = event.url.pathname;
	const sessionToken: string | undefined = event.cookies.get('session');
	const isSessionValid: boolean = await UserService.validateSessionToken(sessionToken);
	const extractedUser: SessionTokenUser | null = UserService.extractUser(sessionToken);

	if (extractedUser && isSessionValid) {
		await UserService.createSessionCookie(event.cookies, event.locals, extractedUser);
	} else {
		await UserService.logout(extractedUser, event.cookies, event.locals);
	}

	if (noAuthURLs.includes(pathname) || isSessionValid) {
		return resolve(event);
	} else {
		return new Response('Redirect', { status: 303, headers: { Location: '/login' } });
	}
};
