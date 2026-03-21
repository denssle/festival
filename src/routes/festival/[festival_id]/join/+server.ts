import type { RequestHandler } from '@sveltejs/kit';
import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';
import { GuestInformationService } from '$lib/services/guest-information.service';
import { UserService } from '$lib/services/user.service';

export const POST: RequestHandler = async ({ cookies, params, request }): Promise<Response> => {
	const blob: Blob = await request.blob();
	const text: string = await blob.text();
	const parsed: BaseGuestInformation = JSON.parse(text);
	parsed.coming = true;
	if (params.festival_id && parsed) {
		await GuestInformationService.joinFestival(
			UserService.extractUser(cookies.get('session')),
			params.festival_id,
			parsed
		);
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 404 });
};
