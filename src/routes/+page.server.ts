import { getAllFestivals } from '$lib/services/festival-event-service';
import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
import type { PageServerLoad } from '../../.svelte-kit/types/src/routes/$types';
import { testConnection } from '$lib/db/db';

export const load: PageServerLoad = async (): Promise<{ festivalEvents: FrontendFestivalEvent[] }> => {
	const festivalEvents: FrontendFestivalEvent[] = await getAllFestivals();
	testConnection();
	return { festivalEvents: festivalEvents };
};
