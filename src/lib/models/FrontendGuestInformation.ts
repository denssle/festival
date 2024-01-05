import type { BackendGuestInformation } from '$lib/models/BackendGuestInformation';
import type { FrontendUser } from '$lib/models/FrontendUser';

export interface FrontendGuestInformation extends BackendGuestInformation {
	user: FrontendUser;
}
