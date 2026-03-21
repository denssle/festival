import type { Cookies } from '@sveltejs/kit';
import { type Actions, error, redirect } from '@sveltejs/kit';
import type {
	PageServerLoad,
	RouteParams
} from '../../../../../.svelte-kit/types/src/routes/festival/[festival_id]/edit/$types';
import { FestivalEventService } from '$lib/services/festival-event.service';
import { UserService } from '$lib/services/user.service';
import { getDateFromString } from '$lib/utils/date.util';
import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { ChangeResult } from '$lib/models/updates/ChangeResult';

export const load: PageServerLoad = async ({
	cookies,
	params
}: {
	cookies: Cookies;
	params: RouteParams;
}): Promise<FrontendFestivalEvent> => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival: FrontendFestivalEvent | null = await FestivalEventService.getFrontEndFestival(festival_id);
		if (festival) {
			const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
			if (user && user.id === festival.createdBy?.id) {
				return festival;
			} else {
				redirect(303, '/');
			}
		}
	}
	error(404, 'Not Found');
};

export const actions: Actions = {
	default: async ({ cookies, request, params }): Promise<Response> => {
		const festivalId: string | undefined = params.festival_id;
		const values: FormData = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		const description: FormDataEntryValue | null = values.get('description');
		if (festivalId && name) {
			const description = values.get('description')?.toString() ?? '';
			const location = values.get('location')?.toString() ?? '';
			const startDate = values.get('startDate')?.toString() ?? '';
			const startTime = values.get('startTime')?.toString() ?? '';
			const bringYourOwnBottle = values.get('bringYourOwnBottle') === 'on';
			const bringYourOwnFood = values.get('bringYourOwnFood') === 'on';

			const result: ChangeResult = await FestivalEventService.updateFestival(
				UserService.extractUser(cookies.get('session')),
				festivalId,
				String(name),
				description,
				getDateFromString(startDate, startTime),
				bringYourOwnBottle,
				bringYourOwnFood,
				location
			);
			if (result === 'Success') {
				redirect(302, '/festival/' + festivalId);
			}
		}
		return new Response(null, { status: 500 });
	}
};
