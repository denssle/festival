import type { PageServerLoad } from '../../../../.svelte-kit/types/src/routes/festival/[festival_id]/$types';
import * as festivalController from '$lib/server/festival-event-service';
import { error } from '@sveltejs/kit';
import { extractUser } from '$lib/server/user-service';

export const load = (async ({ cookies, request, locals, params }) => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival = await festivalController.getFestival(festival_id);
		if (festival) {
			const user = extractUser(cookies.get('session'));
			return {
				festival: festival,
				yourFestival: user?.id === festival.createdBy
			};
		}
	}
	throw error(404, 'Not Found');
}) satisfies PageServerLoad;
