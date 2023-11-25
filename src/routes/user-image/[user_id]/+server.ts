import type { RequestHandler } from '@sveltejs/kit';
import { getUserImage } from '$lib/services/user-service';
import type { RouteParams } from '../../user-image/[user_id]/$types';

export const GET: RequestHandler = async ({ params }: { params: RouteParams }): Promise<Response> => {
	const user_id: string = params.user_id;
	if (user_id) {
		const imageData: string | null = await getUserImage(user_id);
		if (imageData) {
			return new Response(imageData, { status: 200 });
		}
	}
	return new Response(null, { status: 404 });
};
