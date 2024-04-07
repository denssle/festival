import type {
	PageServerLoad,
	RouteParams
} from '../../../../.svelte-kit/types/src/routes/festival/[festival_id]/$types';
import type { Cookies } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { getFrontEndFestival } from '$lib/services/festival-event-service';
import type { BackendUser } from '$lib/models/user/BackendUser';
import { extractUser } from '$lib/services/user-service';
import type { FestivalTransferData } from '$lib/models/FestivalTransferData';

export const load: PageServerLoad = async ({
	cookies,
	params
}: {
	cookies: Cookies;
	params: RouteParams;
}): Promise<FestivalTransferData> => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival: FrontendFestivalEvent | null = await getFrontEndFestival(festival_id);
		if (festival) {
			const user: BackendUser | null = extractUser(cookies.get('session'));
			if (user) {
				return {
					festival: festival,
					yourFestival: user.id === festival.createdBy?.id,
					guestInformation: festival.frontendGuestInformation.find((value) => value.user.id === user.id)
				};
			}
		}
	}
	error(404, 'Not Found');
};
