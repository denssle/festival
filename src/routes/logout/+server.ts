import type { RequestHandler } from './$types';

/* Logout */
export const POST: RequestHandler = async ({ cookies, locals }): Promise<Response> => {
	cookies.delete('session', { path: '/' });
	locals.currentUser = undefined;
	return new Response(null, { status: 303 });
};
