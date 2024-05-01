import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';

export function getTotalNumberOfComingGuests(festival: FrontendFestivalEvent): number {
	const filtered: FrontendGuestInformation[] = festival.frontendGuestInformation.filter((value) => value.coming);
	let result: number = filtered.length;
	for (const information of filtered) {
		result += information.numberOfOtherGuests;
	}
	return result;
}

export function getTotalNumberOfNotComingGuests(festival: FrontendFestivalEvent): number {
	return festival.frontendGuestInformation.filter((value) => !value.coming).length;
}
