import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { getDateFromString } from '$lib/utils/date.util';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import { FestivalEventService } from '$lib/services/festival-event.service';
import { resolve } from '$app/paths';

/**
 * actions.default – POST /festival/new
 *
 * Erstellt ein neues Festival mit den angegebenen Formulardaten.
 * Leitet nach erfolgreicher Erstellung auf die Festival-Detailseite weiter.
 * Nicht eingeloggte Nutzer werden zu /login weitergeleitet.
 *
 * Formularfelder: name (string), description (string), location (string),
 *                 startDate (string), startTime (string),
 *                 bringYourOwnBottle (checkbox), bringYourOwnFood (checkbox)
 *
 * @returns Redirect zu /festival/:id bei Erfolg, 404 wenn kein Name angegeben
 */
export const actions: Actions = {
	default: async ({ locals, request }) => {
		const user = locals.currentUser ?? null;
		if (!user) {
			throw redirect(302, resolve('/login'));
		}

		const values: FormData = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		if (!name) {
			return fail(400, { message: 'Name is required' });
		}

		const description = values.get('description')?.toString() ?? '';
		const location = values.get('location')?.toString() ?? '';
		const startDate = values.get('startDate')?.toString() ?? '';
		const startTime = values.get('startTime')?.toString() ?? '';
		const bringYourOwnBottle = values.get('bringYourOwnBottle') === 'on';
		const bringYourOwnFood = values.get('bringYourOwnFood') === 'on';

		const newFestival: FrontendFestivalEvent | null = await FestivalEventService.createFestival(
			user,
			String(name),
			description,
			getDateFromString(startDate, startTime),
			bringYourOwnBottle,
			bringYourOwnFood,
			location
		);
		if (newFestival && newFestival.id) {
			redirect(302, resolve('/festival/[festival_id]', { festival_id: newFestival.id }));
		}
		return fail(500, { message: 'Festival creation failed' });
	}
};
