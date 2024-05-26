import type { Cookies } from '@sveltejs/kit';
import { type Actions, error, redirect } from '@sveltejs/kit';
import type {
	PageServerLoad,
	RouteParams
} from '../../../../../.svelte-kit/types/src/routes/festival/[festival_id]/edit/$types';
import { getFrontEndFestival, updateFestival } from '$lib/services/festivalEvent.service';
import { extractUser } from '$lib/services/user.service';
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
		const festival: FrontendFestivalEvent | null = await getFrontEndFestival(festival_id);
		if (festival) {
			const user: SessionTokenUser | null = extractUser(cookies.get('session'));
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
			const result: ChangeResult = await updateFestival(
				extractUser(cookies.get('session')),
				festivalId,
				String(name),
				String(description),
				getDateFromString(String(values.get('startDate')), String(values.get('startTime'))),
				Boolean(values.get('bringYourOwnBottle')),
				Boolean(values.get('bringYourOwnFood')),
				String(values.get('location'))
			);
			if (result === 'Success') {
				redirect(302, '/festival/' + festivalId);
			}
		}
		return new Response(null, { status: 500 });
	}
};
