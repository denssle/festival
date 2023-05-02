import * as db from './../lib/server/database';
import { FestivalEvent } from '$lib/models/FestivalEvent';
import type { Actions } from '@sveltejs/kit';

export function load() {
	const loaded = db.get();
	console.log('load', loaded);
	return {
		festivalEvents: loaded.map(value => new FestivalEvent(value.id, value.name))
	};
}

export const actions = {

	default: async ({ cookies, request }) => {
		console.log('actions default');
		console.log(cookies);
		console.log(request);
		/*
		const data = await request.formData();
		console.log(data);
		db.create(data.get('name'));
		 */
	}

	/*
	delete: async ({ cookies, request }) => {
		console.log(cookies);
		console.log(request);
		const data = await request.formData();
		// db.deleteTodo(cookies.get('userid'), data.get('id'));
	}
	 */
} satisfies Actions;