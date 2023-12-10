import type { GuestInformation } from '$lib/models/GuestInformation';
import type { FrontendUser } from '$lib/models/FrontendUser';

export interface FrontendGuestInformation extends GuestInformation {
	user: FrontendUser;
}
