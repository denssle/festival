import * as festivalController from '$lib/server/festival-event-service';
import type { PageServerLoad } from '../../.svelte-kit/types/src/routes/$types';
import type { FestivalListItem } from '$lib/models/FestivalListItem';

export const load = (async ({ cookies, request, locals }) => {
	console.log('locals', locals);
	const festivalEvents: FestivalListItem[] = await festivalController.getAllFestivals();
	console.log('root: return loaded events', festivalEvents.length);
	return {
		// TODO why the mapping?
		loadedEvents: festivalEvents.map((value) => {
			return { id: value.id, name: value.name };
		})
	};
}) satisfies PageServerLoad;
