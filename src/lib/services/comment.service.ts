import { CommentAttributes } from '$lib/db/attributes/comment.attributes';
import { FrontendComment } from '$lib/models/transferData/FrontendComment';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { Comment } from '$lib/db/model/comment';
import { User } from '$lib/db/model/user';
import { Op } from 'sequelize';
import { FrontendUser } from '$lib/models/user/FrontendUser';
import { UserService } from '$lib/services/user.service';
import { UserAttributes } from '$lib/db/attributes/user.attributes';

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
		const comments = findAll.map((value) => value.get({ plain: true }));

		const userIds = [...new Set(comments.map((c) => c.writtenBy))];
		const users = await User.findAll({
			where: { id: { [Op.in]: userIds } }
		});
		const userMap = new Map<string, FrontendUser>();
		for (const u of users) {
			const attrs = u.get({ plain: true }) as UserAttributes;
			userMap.set(attrs.id, UserService.parseBackendUserToFrontend(attrs as any));
		}

		return comments.map((value) => ({
			id: value.id,
			comment: value.comment,
			createdAt: value.createdAt,
			updatedAt: value.updatedAt,
			writtenTo: value.writtenTo,
			writtenBy: userMap.get(value.writtenBy) ?? null,
			yourComment: value.writtenBy === userID,
			editMode: false
		}));
	}

	/**
	 * Löscht alle Kommentare, die an ein Ziel (Festival oder Profil) geschrieben wurden.
	 * `writtenTo` ist polymorph (Festival- ODER User-ID) und kann daher keinen FK mit
	 * ON DELETE CASCADE haben – die Kommentare müssen beim Löschen des Ziels explizit
	 * mitentfernt werden, sonst bleiben sie als Waisen in der DB zurück.
	 */
	static async deleteCommentsWrittenTo(writtenTo: string): Promise<number> {
		return await Comment.destroy({
			where: {
				writtenTo: writtenTo
			}
		});
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
