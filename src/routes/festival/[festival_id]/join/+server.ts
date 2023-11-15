import { joinFestival } from '$lib/services/festival-event-service';
import { extractUser } from '$lib/services/user-service';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, params }) => {
	if (params.festival_id) {
		joinFestival(extractUser(cookies.get('session')), params.festival_id);
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 404 });
};
