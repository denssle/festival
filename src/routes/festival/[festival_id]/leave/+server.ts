import { leaveFestival } from '$lib/services/festival-event-service';
import { extractUser } from '$lib/services/user-service';

export async function POST({ params, cookies }) {
	await leaveFestival(extractUser(cookies.get('session')), params.festival_id);
	return new Response(null, { status: 200 });
}
