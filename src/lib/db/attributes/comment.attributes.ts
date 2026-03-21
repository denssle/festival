import { FrontendComment } from '$lib/models/transferData/FrontendComment';
import { UserService } from '$lib/services/user.service';

export interface CommentAttributes {
	id: string;
	writtenBy: string;
	writtenTo: string;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
}

export async function mapToFrontendComment(attribute: CommentAttributes, userID: string): Promise<FrontendComment> {
	return {
		id: attribute.id,
		comment: attribute.comment,
		createdAt: attribute.createdAt,
		updatedAt: attribute.updatedAt,
		writtenTo: attribute.writtenTo,
		writtenBy: (await UserService.loadFrontEndUserById(attribute.writtenBy)) ?? null,
		yourComment: attribute.writtenBy === userID,
		editMode: false
	};
}
