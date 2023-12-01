import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
import { extractUser } from '$lib/services/user-service';
import { createDateTimeFromStrings } from '$lib/utils/dateUtils';
import { type Actions, redirect } from '@sveltejs/kit';
import { create } from '$lib/services/festival-event-service';
import type { StandardResponse } from '$lib/models/StandardResponse';

export const actions: Actions = {
	default: async ({ cookies, request }): Promise<StandardResponse | undefined> => {
		const values = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		if (name) {
			const description: FormDataEntryValue | null = values.get('description');
			const newFestival: FrontendFestivalEvent | null = await create(
				extractUser(cookies.get('session')),
				String(name),
				String(description),
				createDateTimeFromStrings(String(values.get('startDate')), String(values.get('startTime')))
			);
			if (newFestival && newFestival.id) {
				throw redirect(302, '/festival/' + newFestival?.id);
			}
		} else {
			return { success: false };
		}
	}
};
