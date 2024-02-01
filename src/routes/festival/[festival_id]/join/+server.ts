import { joinFestival } from '$lib/services/festival-event-service';
import { extractUser } from '$lib/services/user-service';
import type { RequestHandler } from '@sveltejs/kit';
import type { BaseGuestInformation } from '$lib/models/BaseGuestInformation';

export const POST: RequestHandler = async ({ cookies, params, request }): Promise<Response> => {
	const blob: Blob = await request.blob();
	const text: string = await blob.text();
	const parsed: BaseGuestInformation = JSON.parse(text);
	parsed.coming = true;
	if (params.festival_id && parsed) {
		await joinFestival(extractUser(cookies.get('session')), params.festival_id, parsed);
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 404 });
};
