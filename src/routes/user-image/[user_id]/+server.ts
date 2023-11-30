import type { RequestHandler } from '@sveltejs/kit';
import { getUserImage } from '$lib/services/user-service';

// TODO Add Types to the parameters
export const GET: RequestHandler = async ({ params }): Promise<Response> => {
	if (params && params.user_id) {
		const imageData: string | null = await getUserImage(params.user_id);
		if (imageData) {
			return new Response(imageData, { status: 200 });
		}
	}
	return new Response(null, { status: 404 });
};
