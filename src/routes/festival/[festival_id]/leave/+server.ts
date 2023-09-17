import { leaveFestival } from '$lib/services/festival-event-service';
import { extractUser, loadFrontEndUserById } from '$lib/services/user-service';

export async function POST({ params, cookies }) {
	await leaveFestival(extractUser(cookies.get('session')), params.festival_id);
	const festival = await loadFrontEndUserById(params.festival_id);
	return new Response(JSON.stringify(festival), { status: 200 });
}
