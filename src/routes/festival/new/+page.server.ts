import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { UserService } from '$lib/services/user.service';
import { getDateFromString } from '$lib/utils/date.util';
import { type Actions, Cookies, redirect } from '@sveltejs/kit';
import { FestivalEventService } from '$lib/services/festival-event.service';

export const actions: Actions = {
	default: async ({ cookies, request }: { cookies: Cookies; request: Request }): Promise<Response | undefined> => {
		const user = UserService.extractUser(cookies.get('session'));
		if (!user) {
			throw redirect(302, '/login');
		}

		const values: FormData = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		if (name) {
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
				redirect(302, '/festival/' + newFestival?.id);
			}
		} else {
			return new Response(null, { status: 404 });
		}
	}
};
