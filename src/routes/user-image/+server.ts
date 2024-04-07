import type { Cookies, RequestHandler } from '@sveltejs/kit';
import type { BackendUser } from '$lib/models/user/BackendUser';
import * as userService from '$lib/services/user-service';
import { saveUserImage } from '$lib/services/user-service';

export const POST: RequestHandler = async ({
	cookies,
	request
}: {
	cookies: Cookies;
	request: Request;
}): Promise<Response> => {
	if (request.body) {
		const blob: Blob = await request.blob();
		const base64Img: string = await blob.text();
		const extractUser: BackendUser | null = userService.extractUser(cookies.get('session'));
		if (base64Img && extractUser) {
			await saveUserImage(extractUser.id, base64Img);
			return new Response(null, { status: 200 });
		}
	}
	console.error('img upload failed', request.body);
	return new Response(null, { status: 500 });
};

export const GET: RequestHandler = async ({ cookies }: { cookies: Cookies }): Promise<Response> => {
	const extractUser: BackendUser | null = userService.extractUser(cookies.get('session'));
	if (extractUser) {
		return new Response(extractUser.image, { status: 200 });
	}
	return new Response(null, { status: 404 });
};
