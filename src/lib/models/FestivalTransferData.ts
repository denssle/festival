import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';

export interface FestivalTransferData {
	festival: FrontendFestivalEvent;
	yourFestival: boolean;
	guestInformation: FrontendGuestInformation | undefined;
}
