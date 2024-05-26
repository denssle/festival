import { Comment } from '$lib/db/db';
import { CommentAttributes, mapToFrontendComment } from '$lib/db/attributes/comment.attributes';
import { FrontendComment } from '$lib/models/FrontendComment';
import { ChangeResult } from '$lib/models/updates/ChangeResult';

export function saveComment(who: string, where: string, comment: string) {
	return Comment.create({
		id: crypto.randomUUID(),
		writtenBy: who,
		writtenTo: where,
		comment: comment
	});
}

export async function getComments(writtenTo: string, userID: string): Promise<FrontendComment[]> {
	const findAll = await Comment.findAll({
		where: {
			writtenTo: writtenTo
		}
	});
	return Promise.all(
		findAll
			.map((value) => value.dataValues)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			.map((value) => mapToFrontendComment(value, userID))
	);
}

export async function deleteComment(userId: string, commentId: string): Promise<ChangeResult> {
	if (commentId && userId) {
		const model = await Comment.findByPk(commentId);
		if (model) {
			if (isChangeAllowed(userId, model.dataValues)) {
				await model.destroy();
				return 'Success';
			} else {
				return 'Not authorized';
			}
		}
	}
	return 'Data Missing';
}

export async function updateComment(userId: string, commentId: string, comment: string): Promise<ChangeResult> {
	if (commentId && userId) {
		const model = await Comment.findByPk(commentId);
		if (model) {
			if (isChangeAllowed(userId, model.dataValues)) {
				await model.update({
					comment: comment
				});
				return 'Success';
			} else {
				return 'Not authorized';
			}
		}
	}
	return 'Data Missing';
}

function isChangeAllowed(userId: string, dataValues: CommentAttributes): boolean {
	return dataValues.writtenBy === userId;
}
