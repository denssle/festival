import { FrontendUser } from '$lib/models/user/FrontendUser';

export interface FrontendComment {
	id: string;
	writtenBy: FrontendUser | null;
	writtenTo: string;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
}