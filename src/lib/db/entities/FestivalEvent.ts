import { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
import { loadFrontEndUserById } from '$lib/services/user-service';
import { BackendFestivalEvent } from '$lib/models/BackendFestivalEvent';

export type FestivalEventAttributes = {
	id: string;
	name: string;
	description: string;
	bringYourOwnBottle: boolean;
	bringYourOwnFood: boolean;
	location: string;
	createdBy: string;
	updatedBy: string;
	createdAt: Date;
	updatedAt: Date;
	startDate: Date;
	UserId: string
};

export async function convertToFrontendFestivalEvent(event: FestivalEventAttributes): Promise<FrontendFestivalEvent> {
	console.log(event);
	return {
		id: event.id,
		name: event.name,
		bringYourOwnBottle: event.bringYourOwnBottle,
		bringYourOwnFood: event.bringYourOwnFood,
		createdAt: event.createdAt,
		createdBy: await loadFrontEndUserById(event.createdBy) ?? null,
		description: event.description,
		startDate: event.startDate,
		location: event.location,
		updatedBy: await loadFrontEndUserById(event.updatedBy) ?? null,
		updatedAt: event.updatedAt,
		frontendGuestInformation: []
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
		createdBy: event.createdBy,
		updatedAt: event.updatedAt,
		updatedBy: event.updatedBy ?? null,
		guestInformation: []
	};
}