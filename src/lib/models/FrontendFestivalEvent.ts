import type { FrontendUser } from '$lib/models/FrontendUser';

export interface FrontendFestivalEvent {
	id: string;
	name: string;
	description: string;
	createdBy: FrontendUser | undefined;
	createdAt: Date | null;
	updatedBy: FrontendUser | undefined;
	updatedAt: Date | null;
	startDate: Date | null;
	visitors: FrontendUser[];
}
