import { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { loadFrontEndUserById } from '$lib/services/user-service';
import { BackendFestivalEvent } from '$lib/models/festivalEvent/BackendFestivalEvent';

export type FestivalEventAttributes = {
	id: string;
	name: string;
	description: string;
	bringYourOwnBottle: boolean;
	bringYourOwnFood: boolean;
	location: string;
	createdAt: Date;
	updatedAt: Date;
	startDate: Date;
	UserId: string;
};

export async function convertToFrontendFestivalEvent(event: FestivalEventAttributes): Promise<FrontendFestivalEvent> {
	console.log(event);
	return {
		id: event.id,
		name: event.name,
		bringYourOwnBottle: event.bringYourOwnBottle,
		bringYourOwnFood: event.bringYourOwnFood,
		createdAt: event.createdAt,
		createdBy: (await loadFrontEndUserById(event.UserId)) ?? null,
		description: event.description,
		startDate: event.startDate,
		location: event.location,
		updatedAt: event.updatedAt,
		frontendGuestInformation: [] // TODO
	};
}

export async function convertToBackendFestivalEvent(event: FestivalEventAttributes): Promise<BackendFestivalEvent> {
	console.log(event);
	return {
		id: event.id,
		name: event.name,
		bringYourOwnBottle: event.bringYourOwnBottle,
		bringYourOwnFood: event.bringYourOwnFood,
		createdAt: event.createdAt,
		location: event.location,
		description: event.description,
		startDate: event.startDate,
		UserId: event.UserId,
		updatedAt: event.updatedAt,
		guestInformation: []
	};
}
