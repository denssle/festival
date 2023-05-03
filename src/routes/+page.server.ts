import * as festivalController from '$lib/server/festival-event-controller';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../../.svelte-kit/types/src/routes/$types';
import * as userController from '$lib/server/user-controller';

export const load = (({ cookies, request }) => {
	console.log('root cookies: ', cookies.get('session'));
	if (userController.validateSessionToken(cookies.get('session'))) {
		const loaded = festivalController.get();
		return {
			loadedEvents: loaded.map((value) => {
				return { id: value.id, name: value.name };
			}),
			success: true,
			authorized: true
		};
	}
	return {
		loadedEvents: [],
		success: false,
		authorized: false
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies, request }) => {
		if (userController.validateSessionToken(cookies.get('session'))) {
			const values = await request.formData();
			const name = values.get('name');
			console.log('default action!');
			if (name) {
				festivalController.create(String(name));
			}
			return { success: true, authorized: false };
		}
		return { success: false, authorized: false };
	}
} satisfies Actions;