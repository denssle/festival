import * as festivalController from '$lib/services/festival-event-service';
import type { PageServerLoad } from '../../.svelte-kit/types/src/routes/$types';
import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

export const load = (async () => {
	const festivalEvents: FrontendFestivalEvent[] = await festivalController.getAllFestivals();
	return { festivalEvents: festivalEvents };
}) satisfies PageServerLoad;
