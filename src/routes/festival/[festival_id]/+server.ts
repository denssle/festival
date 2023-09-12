import { extractUser } from '$lib/services/user-service';
import { deleteFestival } from '$lib/services/festival-event-service';

export function DELETE({ params, request, cookies }) {
	deleteFestival(extractUser(cookies.get('session')), params.festival_id);
	return new Response(null, { status: 303 });
}
