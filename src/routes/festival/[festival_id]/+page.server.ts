import type {
	PageServerLoad,
	RouteParams
} from '../../../../.svelte-kit/types/src/routes/festival/[festival_id]/$types';
import { error } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
import { getFrontEndFestival, isVisitorOfFestival } from '$lib/services/festival-event-service';
import type { BackendUser } from '$lib/models/BackendUser';
import { extractUser } from '$lib/services/user-service';

export const load: PageServerLoad = async ({
	cookies,
	params
}: {
	cookies: Cookies;
	params: RouteParams;
}): Promise<{ festival: FrontendFestivalEvent; yourFestival: boolean; visitor: boolean }> => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival: FrontendFestivalEvent | null = await getFrontEndFestival(festival_id);
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
	error(404, 'Not Found');
};
