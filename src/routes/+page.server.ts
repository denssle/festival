import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import type { PageServerLoad } from './$types';
import { FestivalEventService } from '$lib/services/festival-event.service';

export const load: PageServerLoad = async (): Promise<{ festivalEvents: FrontendFestivalEvent[] }> => {
	const festivalEvents: FrontendFestivalEvent[] = await FestivalEventService.getAllFestivals();
	return { festivalEvents: festivalEvents };
};
