import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { FestivalEventService } from '$lib/services/festival-event.service';

export const load: PageServerLoad = async ({ locals }): Promise<{ festivalEvents: FrontendFestivalEvent[] }> => {
	// Der Auth-Hook lässt diese Seite nur mit Session durch; die Prüfung ist Absicherung.
	if (!locals.currentUser) {
		error(401);
	}
	const festivalEvents: FrontendFestivalEvent[] = await FestivalEventService.getAllFestivals(locals.currentUser.id);
	return { festivalEvents: festivalEvents };
};
