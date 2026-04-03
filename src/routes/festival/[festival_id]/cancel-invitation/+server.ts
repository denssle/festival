import { UserService } from '$lib/services/user.service';
import type { RequestHandler } from '@sveltejs/kit';
import { GuestInformationService } from '$lib/services/guest-information.service';

export const POST: RequestHandler = async ({ cookies, params, request }) => {
	const extractUser = UserService.extractUser(cookies.get('session'));
	if (!extractUser) {
		return new Response('Unauthorized', { status: 401 });
	}

	const blob: Blob = await request.blob();
	const comment: string = await blob.text();

	if (params.festival_id) {
		await GuestInformationService.cancelInvitation(extractUser, params.festival_id, comment);
		return new Response(null, { status: 200 });
	}
	return new Response('Bad Request', { status: 400 });
};
