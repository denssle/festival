import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

export function getTotalNumberOfGuests(festival: FrontendFestivalEvent): number {
	let result = festival.guestInformation.length;
	for (const information of festival.guestInformation) {
		result += information.numberOfOtherGuests;
	}
	return result;
}
