import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
import { FrontendGuestInformation } from '$lib/models/FrontendGuestInformation';

export interface FestivalTransferData {
	festival: FrontendFestivalEvent;
	yourFestival: boolean;
	guestInformation: FrontendGuestInformation | undefined;
}
