import type { PageServerLoad } from '../../../../.svelte-kit/types/src/routes/festival/[festival_id]/$types';
import * as festivalController from '$lib/services/festival-event-service';
import { error } from '@sveltejs/kit';
import { extractUser } from '$lib/services/user-service';
import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
import type { BackendUser } from '$lib/models/BackendUser';
import { isVisitorOfFestival } from '$lib/services/festival-event-service';

export const load = (async ({ cookies, request, locals, params }) => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival: FrontendFestivalEvent | null = await festivalController.getFrontEndFestival(festival_id);
		if (festival) {
			const user: BackendUser | null = extractUser(cookies.get('session'));
			if (user) {
				return {
					festival: festival,
					yourFestival: user.id === festival.createdBy?.id,
					visitor: isVisitorOfFestival(festival, user)
				};
			}
		}
	}
	throw error(404, 'Not Found');
}) satisfies PageServerLoad;
