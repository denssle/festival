import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';

export interface BackendGuestInformation extends BaseGuestInformation {
	UserId: string;
	FestivalEventId: string;
}
