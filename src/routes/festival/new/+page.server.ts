import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
import { extractUser } from '$lib/services/user-service';
import { getUTCFromString } from '$lib/utils/dateUtils';
import { type Actions, Cookies, redirect } from '@sveltejs/kit';
import { createFestival } from '$lib/services/festival-event-service';

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
				getUTCFromString(String(values.get('startDate')), String(values.get('startTime'))),
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
