import type { BackendGuestInformation } from '$lib/models/guestInformation/BackendGuestInformation';
import type { FrontendUser } from '$lib/models/user/FrontendUser';

export interface FrontendGuestInformation extends BackendGuestInformation {
	user: FrontendUser;
}
