import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { extractUser } from '$lib/services/user.service';
import { getDateFromString } from '$lib/utils/date.util';
import { type Actions, Cookies, redirect } from '@sveltejs/kit';
import { createFestival } from '$lib/services/festivalEvent.service';

export const actions: Actions = {
	default: async ({ cookies, request }: { cookies: Cookies; request: Request }): Promise<Response | undefined> => {
		const values: FormData = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		if (name) {
			const description: FormDataEntryValue | null = values.get('description');
			const newFestival: FrontendFestivalEvent | null = await createFestival(
				extractUser(cookies.get('session')),
				String(name),
				String(description),
				getDateFromString(String(values.get('startDate')), String(values.get('startTime'))),
				Boolean(values.get('bringYourOwnBottle')),
				Boolean(values.get('bringYourOwnFood')),
				String(values.get('location'))
			);
			if (newFestival && newFestival.id) {
				redirect(302, '/festival/' + newFestival?.id);
			}
		} else {
			return new Response(null, { status: 404 });
		}
	}
};
