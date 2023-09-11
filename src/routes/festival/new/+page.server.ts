import * as festivalController from '$lib/server/festival-event-service';
import type { Actions } from '@sveltejs/kit';
import { extractUser } from '$lib/server/user-service';

export const actions = {
	default: async ({ cookies, request }) => {
		const values = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		if (name) {
			const description: FormDataEntryValue | null = values.get('description');
			festivalController.create(extractUser(cookies.get('session')), String(name), String(description));
			return { success: true };
		} else {
			return { success: false };
		}
	}
} satisfies Actions;
