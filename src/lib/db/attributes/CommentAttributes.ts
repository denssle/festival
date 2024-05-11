import { FrontendComment } from '$lib/models/FrontendComment';
import { loadFrontEndUserById } from '$lib/services/user-service';

export interface CommentAttributes {
	id: string;
	writtenBy: string;
	writtenTo: string;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
}

export async function mapToFrontendComment(attribute: CommentAttributes): Promise<FrontendComment> {
	return {
		id: attribute.id,
		comment: attribute.comment,
		createdAt: attribute.createdAt,
		updatedAt: attribute.updatedAt,
		writtenTo: attribute.writtenTo,
		writtenBy: (await loadFrontEndUserById(attribute.writtenBy)) ?? null
	}
}