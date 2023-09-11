import * as festivalController from '$lib/server/festival-event-service';
import { Actions, error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../../../.svelte-kit/types/src/routes/$types';

export const load = (async ({ cookies, request, locals, params }) => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival = await festivalController.getFestival(festival_id);
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
		if (festivalId && name && description) {
			festivalController.updateFestival(festivalId, String(name), String(description));
			throw redirect(302, '/festival/' + festivalId);
		} else {
			return { success: false, errorMessage: 'Mop' };
		}
	}
} satisfies Actions;
