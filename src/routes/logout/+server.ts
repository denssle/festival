import type { RequestHandler } from './$types';

/* Logout */
export const POST = (async ({ cookies }) => {
	await cookies.delete('session');
	return new Response(null, { status: 303 });
}) satisfies RequestHandler;
