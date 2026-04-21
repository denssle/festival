import { FestivalEventService } from '$lib/services/festival-event.service';
import { UserService } from '$lib/services/user.service';
import type { RequestHandler } from '@sveltejs/kit';
import { ChangeResult } from '$lib/models/updates/ChangeResult';

export const DELETE: RequestHandler = async ({ cookies, params }): Promise<Response> => {
	if (params && params.festival_id) {
		const result: ChangeResult = await FestivalEventService.deleteFestival(
			UserService.extractUser(cookies.get('session')),
			params.festival_id
		);
		if (result === 'Success') {
			return new Response(null, { status: 303 });
		} else if (result === 'Not authorized') {
			return new Response(null, { status: 403 });
		}
	}
	return new Response(null, { status: 400 });
};
