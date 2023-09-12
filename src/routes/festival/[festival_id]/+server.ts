import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { extractUser } from '$lib/server/user-service';
import { deleteFestival } from '$lib/server/festival-event-service';

export const DELETE = (async ({ cookies, params }) => {
	await deleteFestival(extractUser(cookies.get('session')), params.festival_id);
	throw redirect(302, '/');
}) satisfies RequestHandler;
