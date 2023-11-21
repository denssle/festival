// https://kit.svelte.dev/docs/hooks
import type { Handle } from '@sveltejs/kit';
import * as userController from '$lib/services/user-service';
import { authorized } from '$lib/stores/authorized-store';
import type { BackendUser } from '$lib/models/BackendUser';

export const handle: Handle = async ({ event, resolve }): Promise<Response> => {
	const pathname: string = event.url.pathname;
	if (!pathname.includes('login') && !pathname.includes('registration')) {
		const sessionCookie: string | undefined = event.cookies.get('session');
		const valid: boolean = await userController.validateSessionToken(sessionCookie);
		authorized.set(valid);
		if (valid) {
			const currentUser: BackendUser | null = userController.extractUser(sessionCookie);
			if (currentUser) {
				event.locals.currentUser = {
					isAuthenticated: valid,
					id: currentUser.id,
					email: currentUser.email,
					nickname: currentUser.nickname
				};
			}
			return resolve(event);
		} else {
			return new Response('Redirect', { status: 303, headers: { Location: '/login' } });
		}
	}
	return resolve(event);
};
