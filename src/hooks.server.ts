import { Handle } from '@sveltejs/kit';
import * as userService from '$lib/services/user.service';
import { startDB } from '$lib/db/db';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';

startDB();

const noAuthURLs: string[] = ['/login', '/registration', '/about', '/impressum'];

export const handle: Handle = async ({ event, resolve }): Promise<Response> => {
	const pathname: string = event.url.pathname;
	const extractedUser: SessionTokenUser | null = userService.extractUser(event.cookies.get('session'));
	const userExistsAndValid: boolean = await userService.userExists(extractedUser);
	if (extractedUser && userExistsAndValid) {
		await userService.createSessionCookie(event.cookies, extractedUser);
	} else {
		userService.logout(extractedUser, event.cookies, event.locals);
	}
	if (noAuthURLs.includes(pathname) || userExistsAndValid) {
		return resolve(event);
	} else {
		return new Response('Redirect', { status: 303, headers: { Location: '/login' } });
	}
};
