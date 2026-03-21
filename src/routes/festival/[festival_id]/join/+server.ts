import type { RequestHandler } from '@sveltejs/kit';
import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';
import { GuestInformationService } from '$lib/services/guest-information.service';
import { UserService } from '$lib/services/user.service';

export const POST: RequestHandler = async ({ cookies, params, request }): Promise<Response> => {
	try {
		const parsed: BaseGuestInformation = await request.json();
		parsed.coming = true;
		const user = UserService.extractUser(cookies.get('session'));
		if (params.festival_id && parsed && user) {
			await GuestInformationService.joinFestival(
				user,
				params.festival_id,
				parsed
			);
			return new Response(JSON.stringify({ success: true }), { status: 200 });
		}
		console.warn('join festival: missing data', { festival_id: params.festival_id, user: !!user, parsed: !!parsed });
		return new Response(JSON.stringify({ success: false, message: 'Missing data' }), { status: 400 });
	} catch (e) {
		console.error('Error joining festival:', e);
		return new Response(JSON.stringify({ success: false, message: (e as Error).message }), { status: 500 });
	}
};
