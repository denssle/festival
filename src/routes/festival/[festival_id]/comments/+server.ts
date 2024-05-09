import { RequestEvent } from '@sveltejs/kit';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { extractUser } from '$lib/services/user-service';

export async function POST(request: RequestEvent): Promise<Response> {
	const data = await request.request.formData();
	const comment = data.get('comment');
	if (comment) {
		const user: SessionTokenUser | null = extractUser(request.cookies.get('session'));
		if (user) {
			console.log('Comment: ', comment);
			console.log('user: ', user.nickname);
			return new Response(null, { status: 200 });
		}
	}
	return new Response(null, { status: 500 });
}
