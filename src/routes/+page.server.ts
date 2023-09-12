import * as festivalController from '$lib/services/festival-event-service';
import type { PageServerLoad } from '../../.svelte-kit/types/src/routes/$types';

export const load = (async () => {
	return await festivalController.getAllFestivals();
}) satisfies PageServerLoad;
