// https://kit.svelte.dev/docs/hooks
import type { Handle } from '@sveltejs/kit';
import * as userController from '$lib/server/user-controller';

export const handle = (async ({ event, resolve }): Promise<Response> => {
	const pathname: string = event.url.pathname;
	console.log('handle pathname', pathname);
	if (!pathname.startsWith('/login') && !pathname.startsWith('/registration')) {
		const sessionCookie: string | undefined = event.cookies.get('session');
		console.log(sessionCookie);
		console.log(event.cookies);
		if (!sessionCookie) {
			const valid = await userController.validateSessionToken(sessionCookie);
			if (valid) {
				return new Response('Redirect', { status: 303, headers: { Location: '/login' } });
			}
		}
	}
	return resolve(event);
}) satisfies Handle;