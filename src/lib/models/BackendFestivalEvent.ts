import type { BaseFestivalEvent } from '$lib/models/BaseFestivalEvent';
import { BackendGuestInformation } from '$lib/models/BackendGuestInformation';

export interface BackendFestivalEvent extends BaseFestivalEvent {
	createdBy: string;
	createdAt: number;
	updatedBy: string | null;
	updatedAt: number | null;
	startDate: number | null;
	guestInformation: BackendGuestInformation[];
}
