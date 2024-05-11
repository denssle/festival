import { Comment } from '$lib/db/db';
import { mapToFrontendComment } from '$lib/db/attributes/CommentAttributes';
import { FrontendComment } from '$lib/models/FrontendComment';

export function saveComment(who: string, where: string, comment: string) {
	return Comment.create({
		id: crypto.randomUUID(),
		writtenBy: who,
		writtenTo: where,
		comment: comment
	});
}

export async function getComments(writtenTo: string): Promise<FrontendComment[]> {
	const findAll = await Comment.findAll({
		where: {
			writtenTo: writtenTo
		}
	});
	return Promise.all(findAll
		.map(value => value.dataValues)
		.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
		.map(value => mapToFrontendComment(value))
	);
}

export function deleteComment() {
}
