import { joinFestival } from '$lib/services/festival-event-service';
import { extractUser } from '$lib/services/user-service';

export function POST({ params, cookies }) {
	joinFestival(extractUser(cookies.get('session')), params.festival_id);
	return new Response(null, { status: 200 });
}
