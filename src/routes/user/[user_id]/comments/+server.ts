import { RequestEvent } from '@sveltejs/kit';
import { POSTComment, GETComments, DELETEComment, PUTComment } from '$lib/controller/comment.controller';

export async function POST(request: RequestEvent): Promise<Response> {
	return await POSTComment(request);
}

export async function GET(request: RequestEvent): Promise<Response> {
	return await GETComments(request);
}

export async function DELETE(request: RequestEvent): Promise<Response> {
	return await DELETEComment(request);
}

export async function PUT(request: RequestEvent): Promise<Response> {
	return await PUTComment(request);
}
