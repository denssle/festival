// https://kit.svelte.dev/docs/hooks
import type { Handle } from '@sveltejs/kit';
import * as userController from '$lib/services/user-service';
import { authorized } from '$lib/stores/authorized-store';
import type { BackendUser } from '$lib/models/BackendUser';

const noAuthURLs: string[] = ['/login', '/registration', '/about', '/impressum', '/favicon.ico'];
export const handle: Handle = async ({ event, resolve }): Promise<Response> => {
	const pathname: string = event.url.pathname;
	console.log('Pathname: ', pathname);
	if (!noAuthURLs.includes(pathname)) {
		console.log('need to be authorized');
		const sessionCookie: string | undefined = event.cookies.get('session');
		const valid: boolean = await userController.validateSessionToken(sessionCookie);
		const currentUser: BackendUser | null = userController.extractUser(sessionCookie);
		authorized.set(valid);
		if (valid && currentUser) {
			event.locals.currentUser = {
				isAuthenticated: valid,
				id: currentUser.id,
				email: currentUser.email,
				nickname: currentUser.nickname
			};
			return resolve(event);
		} else {
			return new Response('Redirect', { status: 303, headers: { Location: '/login' } });
		}
	}
	console.log('no need for auth');
	return resolve(event);
};
