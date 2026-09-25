import { CommentAttributes } from '$lib/db/attributes/comment.attributes';
import { FrontendComment } from '$lib/models/transferData/FrontendComment';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { Comment } from '$lib/db/model/comment';
import { User } from '$lib/db/model/user';
import { ForeignKeyConstraintError, Op } from 'sequelize';
import { FrontendUser } from '$lib/models/user/FrontendUser';
import { UserService } from '$lib/services/user.service';
import { convertToBackendUser, UserAttributes } from '$lib/db/attributes/user.attributes';

/**
 * Worauf ein Kommentar geschrieben wird: ein Festival oder ein Nutzerprofil.
 * Die Route entscheidet das (`/festival/:festival_id/comments` bzw. `/user/:user_id/comments`).
 */
export type CommentTarget = { festivalId: string } | { profileUserId: string };

/** Die Spalte, in der das jeweilige Ziel steht. */
function targetColumns(target: CommentTarget): Pick<CommentAttributes, 'FestivalEventId' | 'ProfileUserId'> {
	return 'festivalId' in target
		? { FestivalEventId: target.festivalId, ProfileUserId: null }
		: { FestivalEventId: null, ProfileUserId: target.profileUserId };
}

export class CommentService {
	/**
	 * Speichert einen Kommentar. Existiert das Ziel nicht, lehnt der FK ab – vor
	 * Migration 0003 ließen sich Kommentare an beliebige IDs schreiben.
	 *
	 * @returns 'Success', oder 'Data Missing', wenn es Ziel oder Autor nicht gibt
	 */
	static async saveComment(who: string, target: CommentTarget, comment: string): Promise<ChangeResult> {
		try {
			await Comment.create({
				id: crypto.randomUUID(),
				writtenBy: who,
				...targetColumns(target),
				comment: comment
			});
			return 'Success';
		} catch (error) {
			if (error instanceof ForeignKeyConstraintError) {
				return 'Data Missing';
			}
			throw error;
		}
	}

	static async getComments(target: CommentTarget, userID: string): Promise<FrontendComment[]> {
		const targetId = 'festivalId' in target ? target.festivalId : target.profileUserId;
		const findAll = await Comment.findAll({
			where: targetColumns(target),
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
			userMap.set(attrs.id, UserService.parseBackendUserToFrontend(convertToBackendUser(attrs)));
		}

		return comments.map((value) => ({
			id: value.id,
			comment: value.comment,
			createdAt: value.createdAt,
			updatedAt: value.updatedAt,
			writtenTo: targetId,
			writtenBy: userMap.get(value.writtenBy) ?? null,
			yourComment: value.writtenBy === userID,
			editMode: false
		}));
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
