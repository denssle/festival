import * as festivalController from '$lib/services/festival-event-service';
import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { extractUser } from '$lib/services/user-service';
import { createDateFromStrings } from '$lib/utils/dateUtils';
import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

export const actions = {
	default: async ({ cookies, request }) => {
		const values = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		if (name) {
			const description: FormDataEntryValue | null = values.get('description');
			const newFestival: FrontendFestivalEvent | null = await festivalController.create(
				extractUser(cookies.get('session')),
				String(name),
				String(description),
				createDateFromStrings(String(values.get('startDate')), String(values.get('startTime')))
			);
			if (newFestival && newFestival.id) {
				throw redirect(302, '/festival/' + newFestival?.id);
			}
		} else {
			return { success: false };
		}
	}
} satisfies Actions;
