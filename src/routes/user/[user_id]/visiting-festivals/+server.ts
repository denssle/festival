import { RequestEvent } from '@sveltejs/kit';
import { getFestivalYouVisit } from '$lib/services/festival-event.service';
import { VisitingFestival } from '$lib/models/user/VisitingFestival';

export async function GET(request: RequestEvent): Promise<Response> {
	const pathId: string | undefined = request.params.user_id?.toString();
	if (pathId) {
		const visitingFestivals: VisitingFestival[] = await getFestivalYouVisit(pathId);
		return new Response(JSON.stringify(visitingFestivals), { status: 200 });
	}
	return new Response(null, { status: 500 });
}
