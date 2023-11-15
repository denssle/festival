import { type Actions, error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../../../.svelte-kit/types/src/routes/$types';
import { getFrontEndFestival, updateFestival } from '$lib/services/festival-event-service';
import { extractUser } from '$lib/services/user-service';
import { createDateFromStrings } from '$lib/utils/dateUtils';
import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

export const load = (async ({ params }) => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival: FrontendFestivalEvent | null = await getFrontEndFestival(festival_id);
		if (festival) {
			return festival;
		}
	}
	throw error(404, 'Not Found');
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies, request }) => {
		const festivalId: string | undefined = request.url.split('/').pop();
		const values = await request.formData();
		const name = values.get('name');
		const description = values.get('description');
		if (festivalId && name) {
			updateFestival(
				extractUser(cookies.get('session')),
				festivalId,
				String(name),
				String(description),
				createDateFromStrings(String(values.get('startDate')), String(values.get('startTime')))
			);
			throw redirect(302, '/festival/' + festivalId);
		} else {
			return { success: false, errorMessage: 'Mop' };
		}
	}
} satisfies Actions;
