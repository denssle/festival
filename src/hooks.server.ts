import type { Handle } from '@sveltejs/kit';
import * as userController from '$lib/services/user.service';
import { startDB } from '$lib/db/db';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';

startDB();

// https://kit.svelte.dev/docs/hooks
const noAuthURLs: string[] = ['/login', '/registration', '/about', '/impressum'];

export const handle: Handle = async ({ event, resolve }): Promise<Response> => {
	const pathname: string = event.url.pathname;
	const sessionCookie: string | undefined = event.cookies.get('session');
	const valid: boolean = await userController.validateSessionToken(sessionCookie);
	const currentUser: SessionTokenUser | null = userController.extractUser(sessionCookie);
	if (currentUser) {
		event.locals.currentUser = {
			isAuthenticated: valid,
			id: currentUser.id,
			email: currentUser.email,
			nickname: currentUser.nickname
		};
	} else {
		event.locals.currentUser = {
			isAuthenticated: false,
			id: '',
			email: '',
			nickname: ''
		};
	}
	if (!noAuthURLs.includes(pathname)) {
		if (valid && currentUser) {
			return resolve(event);
		} else {
			return new Response('Redirect', { status: 303, headers: { Location: '/login' } });
		}
	}
	return resolve(event);
};
