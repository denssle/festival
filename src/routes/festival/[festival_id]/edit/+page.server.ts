import type { Cookies } from '@sveltejs/kit';
import { type Actions, error, redirect } from '@sveltejs/kit';
import type {
	PageServerLoad,
	RouteParams
} from '../../../../../.svelte-kit/types/src/routes/festival/[festival_id]/edit/$types';
import { getFrontEndFestival, updateFestival } from '$lib/services/festival-event-service';
import { extractUser } from '$lib/services/user-service';
import { getUTCFromString } from '$lib/utils/dateUtils';
import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import type { BackendUser } from '$lib/models/user/BackendUser';

export const load: PageServerLoad = async ({
	cookies,
	params
}: {
	cookies: Cookies;
	params: RouteParams;
}): Promise<FrontendFestivalEvent> => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival: FrontendFestivalEvent | null = await getFrontEndFestival(festival_id);
		if (festival) {
			const user: BackendUser | null = extractUser(cookies.get('session'));
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
			await updateFestival(
				extractUser(cookies.get('session')),
				festivalId,
				String(name),
				String(description),
				getUTCFromString(String(values.get('startDate')), String(values.get('startTime'))),
				Boolean(values.get('bringYourOwnBottle')),
				Boolean(values.get('bringYourOwnFood')),
				String(values.get('location'))
			);
			redirect(302, '/festival/' + festivalId);
		} else {
			return new Response(null, { status: 404 });
		}
	}
};
