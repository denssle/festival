import * as festivalController from '$lib/server/festival-event-service';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../../../.svelte-kit/types/src/routes/$types';

export const load = (async ({ cookies, request, locals, params }) => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival = await festivalController.getFestival(festival_id);
		if (festival) {
			return festival;
		}
	}
	throw error(404, 'Not Found');
}) satisfies PageServerLoad;
