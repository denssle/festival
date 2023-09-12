import * as festivalController from '$lib/server/festival-event-service';
import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { extractUser } from '$lib/server/user-service';

export const actions = {
	default: async ({ cookies, request }) => {
		const values = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		if (name) {
			const description: FormDataEntryValue | null = values.get('description');
			const newFestival = festivalController.create(extractUser(cookies.get('session')), String(name), String(description));
			if (newFestival && newFestival.id) {
				throw redirect(302, '/festival/' + newFestival?.id);
			}
		} else {
			return { success: false };
		}
	}
} satisfies Actions;
