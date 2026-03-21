import { Handle } from '@sveltejs/kit';
import { UserService } from '$lib/services/user.service';
import { startDB } from '$lib/db/db';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';

startDB();

const noAuthURLs: string[] = ['/login', '/registration', '/about', '/impressum'];

export const handle: Handle = async ({ event, resolve }): Promise<Response> => {
	const pathname: string = event.url.pathname;
	const extractedUser: SessionTokenUser | null = UserService.extractUser(event.cookies.get('session'));
	const userExistsAndValid: boolean = await UserService.userExists(extractedUser);
	if (extractedUser && userExistsAndValid) {
		await UserService.createSessionCookie(event.cookies, event.locals, extractedUser);
	} else {
		UserService.logout(extractedUser, event.cookies, event.locals);
	}
	if (noAuthURLs.includes(pathname) || userExistsAndValid) {
		return resolve(event);
	} else {
		return new Response('Redirect', { status: 303, headers: { Location: '/login' } });
	}
};
