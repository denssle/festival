import { extractUser } from '$lib/server/user-service';
import { deleteFestival } from '$lib/server/festival-event-service';

export function DELETE({ params, request, cookies }) {
	deleteFestival(extractUser(cookies.get('session')), params.festival_id);
	return new Response(null, { status: 303 });
}
