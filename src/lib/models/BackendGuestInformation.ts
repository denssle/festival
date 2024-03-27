import type { BaseGuestInformation } from '$lib/models/BaseGuestInformation';

export interface BackendGuestInformation extends BaseGuestInformation {
	userId: string;
}
