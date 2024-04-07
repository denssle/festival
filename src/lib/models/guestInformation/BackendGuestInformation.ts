import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';

export interface BackendGuestInformation extends BaseGuestInformation {
	userId: string;
}
