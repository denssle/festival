import type { FrontendUser } from '../user/FrontendUser';
import type { BaseFestivalEvent } from '$lib/models/festivalEvent/BaseFestivalEvent';
import type { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';

export interface FrontendFestivalEvent extends BaseFestivalEvent {
	createdBy: FrontendUser | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	startDate: Date | null;
	frontendGuestInformation: FrontendGuestInformation[];
}
