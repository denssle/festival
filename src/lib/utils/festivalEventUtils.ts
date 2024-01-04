import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

export function getTotalNumberOfGuests(festival: FrontendFestivalEvent): number {
	let result: number = festival.frontendGuestInformation.length;
	for (const information of festival.frontendGuestInformation) {
		result += information.numberOfOtherGuests;
	}
	return result;
}
