import { getAllFestivals } from '$lib/services/festival-event-service';
import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
import type { PageServerLoad } from '../../.svelte-kit/types/src/routes/$types';

export const load: PageServerLoad = async (): Promise<{ festivalEvents: FrontendFestivalEvent[] }> => {
	const festivalEvents: FrontendFestivalEvent[] = await getAllFestivals();
	return { festivalEvents: festivalEvents };
};
