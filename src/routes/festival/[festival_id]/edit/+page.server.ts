import type { Cookies } from '@sveltejs/kit';
import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';
import { FestivalEventService } from '$lib/services/festival-event.service';
import { UserService } from '$lib/services/user.service';
import { getDateFromString } from '$lib/utils/date.util';
import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { ChangeResult, getHTTPCodeForChangeResult } from '$lib/models/updates/ChangeResult';

/**
 * load – GET /festival/:festival_id/edit
 *
 * Lädt die Daten des Festivals für das Bearbeitungsformular.
 * Nur der Ersteller des Festivals darf diese Seite aufrufen.
 * Andere Nutzer werden zur Startseite weitergeleitet, unbekannte Festivals ergeben 404.
 *
 * @param cookies - Session-Cookie zur Authentifizierung
 * @param params.festival_id - ID des zu bearbeitenden Festivals
 * @returns FrontendFestivalEvent-Objekt mit allen Festival-Daten
 */
export const load: PageServerLoad = async ({
	cookies,
	params
}: {
	cookies: Cookies;
	params: RouteParams;
}): Promise<FrontendFestivalEvent> => {
	const festival_id: string = params.festival_id;
	if (festival_id) {
		const festival: FrontendFestivalEvent | null = await FestivalEventService.getFrontEndFestival(festival_id);
		if (festival) {
			const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
			if (user && user.id === festival.createdBy?.id) {
				return festival;
			} else {
				redirect(303, '/');
			}
		}
	}
	error(404, 'Not Found');
};

/**
 * actions.default – POST /festival/:festival_id/edit
 *
 * Aktualisiert ein bestehendes Festival mit den übergebenen Formulardaten.
 * Nur der Ersteller des Festivals darf Änderungen vornehmen.
 * Nicht eingeloggte Nutzer werden zu /login weitergeleitet.
 *
 * Formularfelder: name (string), description (string), location (string),
 *                 startDate (string), startTime (string),
 *                 bringYourOwnBottle (checkbox), bringYourOwnFood (checkbox)
 *
 * @returns Redirect zu /festival/:id bei Erfolg, 500 bei Fehler
 */
export const actions: Actions = {
	default: async ({ cookies, request, params }) => {
		const festivalId: string | undefined = params.festival_id;
		const values: FormData = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		const user = UserService.extractUser(cookies.get('session'));

		if (!user) {
			throw redirect(302, '/login');
		}

		if (!festivalId || !name) {
			return fail(400, { message: 'Missing festival id or name' });
		}

		const description = values.get('description')?.toString() ?? '';
		const location = values.get('location')?.toString() ?? '';
		const startDate = values.get('startDate')?.toString() ?? '';
		const startTime = values.get('startTime')?.toString() ?? '';
		const bringYourOwnBottle = values.get('bringYourOwnBottle') === 'on';
		const bringYourOwnFood = values.get('bringYourOwnFood') === 'on';

		const result: ChangeResult = await FestivalEventService.updateFestival(
			user,
			festivalId,
			String(name),
			description,
			getDateFromString(startDate, startTime),
			bringYourOwnBottle,
			bringYourOwnFood,
			location
		);
		if (result === 'Success') {
			redirect(302, '/festival/' + festivalId);
		}
		return fail(getHTTPCodeForChangeResult(result), { message: result });
	}
};
