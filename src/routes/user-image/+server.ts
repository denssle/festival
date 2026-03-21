import type { Cookies, RequestHandler } from '@sveltejs/kit';
import * as userService from '$lib/services/user.service';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { UserService } from '$lib/services/user.service';

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
		const extractUser: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
		if (base64Img && extractUser) {
			await UserService.saveUserImage(extractUser.id, base64Img);
			return new Response(null, { status: 200 });
		}
	}
	return new Response(null, { status: 500 });
};

export const GET: RequestHandler = async ({ cookies }: { cookies: Cookies }): Promise<Response> => {
	const extractUser: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
	if (extractUser) {
		return new Response(await UserService.getUserImage(extractUser.id), { status: 200 });
	}
	return new Response(null, { status: 404 });
};
