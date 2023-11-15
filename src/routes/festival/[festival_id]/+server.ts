import { deleteFestival } from '$lib/services/festival-event-service';
import { extractUser } from '$lib/services/user-service';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ cookies, params }) => {
	if (params && params.festival_id) {
		deleteFestival(extractUser(cookies.get('session')), params.festival_id);
		return new Response(null, { status: 303 });
	}
	return new Response(null, { status: 200 });
};
