import type { BaseFestivalEvent } from '$lib/models/festivalEvent/BaseFestivalEvent';
import { BackendGuestInformation } from '$lib/models/guestInformation/BackendGuestInformation';

export interface BackendFestivalEvent extends BaseFestivalEvent {
	createdBy: string;
	createdAt: Date;
	updatedBy: string | null;
	updatedAt: Date | null;
	startDate: Date | null;
	guestInformation: BackendGuestInformation[];
}
