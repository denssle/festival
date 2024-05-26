import { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { loadFrontEndUserById } from '$lib/services/user.service';
import { BackendFestivalEvent } from '$lib/models/festivalEvent/BackendFestivalEvent';
import { Model } from 'sequelize';
import {
	GuestInformationAttributes,
	mapToBackendGuestInformation,
	mapToFrontendGuestInformation
} from '$lib/db/attributes/guestInformation.attributes';

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
	GuestInformations: Model<GuestInformationAttributes, any>[];
};

export async function mapToFrontendFestivalEvent(event: FestivalEventAttributes): Promise<FrontendFestivalEvent> {
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
		frontendGuestInformation: event.GuestInformations
			? await Promise.all(
					event.GuestInformations.map((value) => {
						return mapToFrontendGuestInformation(value.dataValues);
					})
				)
			: []
	};
}

export async function mapToBackendFestivalEvent(event: FestivalEventAttributes): Promise<BackendFestivalEvent> {
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
		guestInformation: event.GuestInformations.map((value) => {
			return mapToBackendGuestInformation(value.dataValues);
		})
	};
}
