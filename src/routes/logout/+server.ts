import type { RequestHandler } from './$types';

/* Logout */
export const POST: RequestHandler = async ({ cookies }): Promise<Response> => {
	cookies.delete('session', { path: '/' });
	return new Response(null, { status: 303 });
};
