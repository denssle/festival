import type { FrontendUser } from './FrontendUser';
import type { BaseFestivalEvent } from '$lib/models/BaseFestivalEvent';
import type { FrontendGuestInformation } from '$lib/models/FrontendGuestInformation';

export interface FrontendFestivalEvent extends BaseFestivalEvent {
	createdBy: FrontendUser;
	createdAt: Date | null;
	updatedBy: FrontendUser | null;
	updatedAt: Date | null;
	startDate: Date | null;
	frontendGuestInformation: FrontendGuestInformation[];
}
