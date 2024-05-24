import { RequestEvent } from '@sveltejs/kit';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { extractUser } from '$lib/services/user-service';
import { deleteComment, getComments, saveComment, updateComment } from '$lib/services/comment-service';
import { FrontendComment } from '$lib/models/FrontendComment';
import { ChangeResult, getHTTPCodeForChangeResult } from '$lib/models/updates/ChangeResult';

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
	const user: SessionTokenUser | null = extractUser(request.cookies.get('session'));
	if (festivalId && user) {
		const comments: FrontendComment[] = await getComments(festivalId, user.id);
		return new Response(JSON.stringify(comments), { status: 200 });
	}
	return new Response(null, { status: 500 });
}

export async function DELETE(request: RequestEvent): Promise<Response> {
	const commentId: string = await request.request.text();
	const user: SessionTokenUser | null = extractUser(request.cookies.get('session'));
	if (commentId && user) {
		const result: ChangeResult = await deleteComment(user.id, commentId);
		return new Response(result, { status: getHTTPCodeForChangeResult(result) });
	}
	return new Response(null, { status: 500 });
}

export async function PUT(request: RequestEvent): Promise<Response> {
	const comment = await request.request.json() as FrontendComment;
	const user: SessionTokenUser | null = extractUser(request.cookies.get('session'));
	if (comment && user) {
		const result: ChangeResult = await updateComment(user.id, comment.id, comment.comment);
		return new Response(result, { status: getHTTPCodeForChangeResult(result) });
	}
	return new Response(null, { status: 500 });
}