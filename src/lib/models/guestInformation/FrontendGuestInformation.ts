import type { FrontendUser } from '$lib/models/user/FrontendUser';
import { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';

export interface FrontendGuestInformation extends BaseGuestInformation {
	user: FrontendUser | undefined;
}
