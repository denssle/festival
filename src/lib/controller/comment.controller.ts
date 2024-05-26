import { RequestEvent } from '@sveltejs/kit';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { extractUser } from '$lib/services/user.service';
import { deleteComment, getComments, saveComment, updateComment } from '$lib/services/comment.service';
import { FrontendComment } from '$lib/models/FrontendComment';
import { ChangeResult, getHTTPCodeForChangeResult } from '$lib/models/updates/ChangeResult';

function getIdFromPath(request: RequestEvent<Partial<Record<string, string>>, string | null>) {
	return request.params.festival_id?.toString() ?? request.params.user_id?.toString();
}

export async function POSTComment(request: RequestEvent<Partial<Record<string, string>>, string | null>) {
	const data: FormData = await request.request.formData();
	const comment: string | undefined = data.get('comment')?.toString();
	const pathId: string | undefined = getIdFromPath(request);
	const user: SessionTokenUser | null = extractUser(request.cookies.get('session'));

	if (comment && pathId && user) {
		await saveComment(user.id, pathId, comment);
		return new Response(null, { status: 200 });
	}
	return new Response(null, { status: 500 });
}

export async function GETComments(request: RequestEvent<Partial<Record<string, string>>, string | null>) {
	const pathId: string | undefined = getIdFromPath(request);
	const user: SessionTokenUser | null = extractUser(request.cookies.get('session'));
	if (pathId && user) {
		const comments: FrontendComment[] = await getComments(pathId, user.id);
		return new Response(JSON.stringify(comments), { status: 200 });
	}
	return new Response(null, { status: 500 });
}

export async function DELETEComment(request: RequestEvent<Partial<Record<string, string>>, string | null>) {
	const commentId: string = await request.request.text();
	const user: SessionTokenUser | null = extractUser(request.cookies.get('session'));
	if (commentId && user) {
		const result: ChangeResult = await deleteComment(user.id, commentId);
		return new Response(result, { status: getHTTPCodeForChangeResult(result) });
	}
	return new Response(null, { status: 500 });
}

export async function PUTComment(request: RequestEvent<Partial<Record<string, string>>, string | null>) {
	const comment = (await request.request.json()) as FrontendComment;
	const user: SessionTokenUser | null = extractUser(request.cookies.get('session'));
	if (comment && user) {
		const result: ChangeResult = await updateComment(user.id, comment.id, comment.comment);
		return new Response(result, { status: getHTTPCodeForChangeResult(result) });
	}
	return new Response(null, { status: 500 });
}
