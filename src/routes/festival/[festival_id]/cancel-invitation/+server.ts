import { extractUser } from '$lib/services/user.service';
import type { RequestHandler } from '@sveltejs/kit';
import { leaveFestival } from '$lib/services/guestInformation.service';

export const POST: RequestHandler = async ({ cookies, params, request }) => {
	const blob: Blob = await request.blob();
	const comment: string = await blob.text();
	if (params.festival_id) {
		await leaveFestival(extractUser(cookies.get('session')), params.festival_id, comment);
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 404 });
};
