import { RequestEvent } from '@sveltejs/kit';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { extractUser } from '$lib/services/user-service';
import { deleteComment, getComments, saveComment } from '$lib/services/comment-service';
import { FrontendComment } from '$lib/models/FrontendComment';

export async function POST(request: RequestEvent): Promise<Response> {
	const data: FormData = await request.request.formData();
	const comment: string | undefined = data.get('comment')?.toString();
	const festivalId: string | undefined = request.params.festival_id?.toString();
	const user: SessionTokenUser | null = extractUser(request.cookies.get('session'));

	if (comment && festivalId && user) {
		await saveComment(user.id, festivalId, comment);
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 500 });
}

export async function GET(request: RequestEvent): Promise<Response> {
	const festivalId: string | undefined = request.params.festival_id?.toString();
	if (festivalId) {
		const comments: FrontendComment[] = await getComments(festivalId);
		return new Response(JSON.stringify(comments), { status: 200 });
	}
	return new Response(null, { status: 500 });
}

export async function DELETE(request: RequestEvent): Promise<Response> {
	const commentId = await request.request.text();
	const user: SessionTokenUser | null = extractUser(request.cookies.get('session'));
	if (commentId && user) {
		await deleteComment(user.id, commentId);
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 500 });
}