import { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { UserService } from '$lib/services/user.service';
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
	EventGuests: Model<GuestInformationAttributes, any>[];
};

export async function mapToFrontendFestivalEvent(event: FestivalEventAttributes): Promise<FrontendFestivalEvent> {
	const userId = event.UserId || (event as any).userId;
	return {
		id: event.id,
		name: event.name,
		bringYourOwnBottle: event.bringYourOwnBottle,
		bringYourOwnFood: event.bringYourOwnFood,
		createdAt: event.createdAt,
		createdBy: (await UserService.loadFrontEndUserById(userId)) ?? null,
		description: event.description,
		startDate: event.startDate,
		location: event.location,
		updatedAt: event.updatedAt,
		frontendGuestInformation:
			event.EventGuests || event.GuestInformations || (event as any).guestInformations
				? await Promise.all(
						(event.EventGuests || event.GuestInformations || (event as any).guestInformations).map((value: any) => {
							return mapToFrontendGuestInformation(value.dataValues);
						})
					)
				: []
	};
}

export async function mapToBackendFestivalEvent(event: FestivalEventAttributes): Promise<BackendFestivalEvent> {
	const userId = event.UserId || (event as any).userId;
	return {
		id: event.id,
		name: event.name,
		bringYourOwnBottle: event.bringYourOwnBottle,
		bringYourOwnFood: event.bringYourOwnFood,
		createdAt: event.createdAt,
		location: event.location,
		description: event.description,
		startDate: event.startDate,
		UserId: userId,
		updatedAt: event.updatedAt,
		guestInformation:
			event.EventGuests || event.GuestInformations || (event as any).guestInformations
				? (event.EventGuests || event.GuestInformations || (event as any).guestInformations).map((value: any) => {
						return mapToBackendGuestInformation(value.dataValues);
					})
				: []
	};
}
