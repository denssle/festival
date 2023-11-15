import type { RequestHandler } from './$types';

/* Logout */
export const POST: RequestHandler = async ({ cookies, params }) => {
	await cookies.delete('session');
	return new Response(null, { status: 303 });
};
