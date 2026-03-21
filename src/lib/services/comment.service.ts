import { CommentAttributes, mapToFrontendComment } from '$lib/db/attributes/comment.attributes';
import { FrontendComment } from '$lib/models/transferData/FrontendComment';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { Comment } from '$lib/db/model/comment';

export class CommentService {
	static async saveComment(who: string, where: string, comment: string) {
		return await Comment.create({
			id: crypto.randomUUID(),
			writtenBy: who,
			writtenTo: where,
			comment: comment
		});
	}

	static async getComments(writtenTo: string, userID: string): Promise<FrontendComment[]> {
		const findAll = await Comment.findAll({
			where: {
				writtenTo: writtenTo
			},
			order: [['createdAt', 'DESC']]
		});
		return Promise.all(findAll.map((value) => value.dataValues).map((value) => mapToFrontendComment(value, userID)));
	}

	static async deleteComment(userId: string, commentId: string): Promise<ChangeResult> {
		if (commentId && userId) {
			const model = await Comment.findByPk(commentId);
			if (model) {
				if (this.isChangeAllowed(userId, model.dataValues)) {
					await model.destroy();
					return 'Success';
				} else {
					return 'Not authorized';
				}
			}
		}
		return 'Data Missing';
	}

	static async updateComment(userId: string, commentId: string, comment: string): Promise<ChangeResult> {
		if (commentId && userId) {
			const model = await Comment.findByPk(commentId);
			if (model) {
				if (this.isChangeAllowed(userId, model.dataValues)) {
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

	private static isChangeAllowed(userId: string, dataValues: CommentAttributes): boolean {
		return dataValues.writtenBy === userId;
	}
}
