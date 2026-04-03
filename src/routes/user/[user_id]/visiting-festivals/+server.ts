import { error, RequestEvent } from '@sveltejs/kit';
import { FestivalEventService } from '$lib/services/festival-event.service';
import { VisitingFestival } from '$lib/models/user/VisitingFestival';
import { UserService } from '$lib/services/user.service';
import { FriendshipService } from '$lib/services/friendship.service';

export async function GET(request: RequestEvent): Promise<Response> {
	const pathId: string | undefined = request.params.user_id?.toString();
	const user = UserService.extractUser(request.cookies.get('session'));

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	if (pathId) {
		// Nur wenn man selbst der User ist oder befreundet ist
		const isOwn = user.id === pathId;
		const isFriend = await FriendshipService.areFriends(user.id, pathId);

		if (isOwn || isFriend) {
			const visitingFestivals: VisitingFestival[] = await FestivalEventService.getFestivalYouVisit(pathId);
			return new Response(JSON.stringify(visitingFestivals), { status: 200 });
		} else {
			throw error(403, 'Forbidden');
		}
	}
	return new Response(null, { status: 500 });
}
