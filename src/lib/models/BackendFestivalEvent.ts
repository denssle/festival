import type { BaseFestivalEvent } from '$lib/models/BaseFestivalEvent';
import { BackendGuestInformation } from '$lib/models/BackendGuestInformation';

export interface BackendFestivalEvent extends BaseFestivalEvent {
	createdBy: string;
	createdAt: Date;
	updatedBy: string | null;
	updatedAt: Date | null;
	startDate: Date | null;
	guestInformation: BackendGuestInformation[];
}
