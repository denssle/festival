import * as db from './../lib/server/database';
import type { Actions } from '@sveltejs/kit';

export function load() {
	const loaded = db.get();
	console.log('load', loaded);
	loaded.push({
		id: crypto.randomUUID(),
		name: ''
	});
	return {
		loadedEvents: loaded.map((value) => {
			return { id: value.id, name: value.name };
		})
	};
}

export const actions = {

	default: async ({ cookies, request }) => {
		console.log('actions default');
		console.log('cookies', cookies);
		console.log('request', request);

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