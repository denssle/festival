import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { FestivalEventService } from '$lib/services/festival-event.service';
import type { FestivalTransferData } from '$lib/models/transferData/FestivalTransferData';
import { CurrentUser } from '$lib/models/user/CurrentUser';

export const load: PageServerLoad = async ({ locals, params }): Promise<FestivalTransferData> => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival: FrontendFestivalEvent | null = await FestivalEventService.getFrontEndFestival(festival_id);
		const user: CurrentUser | undefined = locals.currentUser;
		if (festival && user) {
			const guestInformation = festival.frontendGuestInformation.find((value) => value.user?.id === user.id);
			return {
				festival: festival,
				yourFestival: user.id === festival.createdBy?.id,
				yourGuestInformation: guestInformation
			};
		}
	}
	error(404, 'Not Found');
};
