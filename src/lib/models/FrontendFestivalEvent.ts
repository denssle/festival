import type { FrontendUser } from './FrontendUser';

export interface FrontendFestivalEvent {
	id: string;
	name: string;
	description: string;
	createdBy: FrontendUser;
	createdAt: Date | null;
	updatedBy: FrontendUser | null;
	updatedAt: Date | null;
	startDate: Date | null;
	visitors: FrontendUser[];
}
