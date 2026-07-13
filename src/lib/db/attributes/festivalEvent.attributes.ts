import { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import { UserService } from '$lib/services/user.service';
import { BackendFestivalEvent } from '$lib/models/festivalEvent/BackendFestivalEvent';
import { Model, type Optional } from 'sequelize';
import { convertToBackendUser, UserAttributes, UserCreationAttributes } from '$lib/db/attributes/user.attributes';
import {
	GuestInformationAttributes,
	GuestInformationCreationAttributes,
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
	// Optional eager-geladener Ersteller (via include: { model: User, as: 'User' }).
	// Wird genutzt, um den N+1-Query pro Festival zu vermeiden.
	User?: Model<UserAttributes, UserCreationAttributes>;
	EventGuests: Model<GuestInformationAttributes, GuestInformationCreationAttributes>[];
};

/**
 * Attribute beim Anlegen: Zeitstempel setzt Sequelize, die `allowNull`-Spalten
 * (siehe src/lib/db/model/festivalEvent.ts) sind optional, und die Assoziationen
 * werden nur beim Lesen per `include` befüllt – nie beim Create übergeben.
 */
export type FestivalEventCreationAttributes = Optional<
	FestivalEventAttributes,
	| 'createdAt'
	| 'updatedAt'
	| 'description'
	| 'location'
	| 'bringYourOwnBottle'
	| 'bringYourOwnFood'
	| 'startDate'
	| 'User'
	| 'EventGuests'
>;

export async function mapToFrontendFestivalEvent(event: FestivalEventAttributes): Promise<FrontendFestivalEvent> {
	const userId = event.UserId;
	// Ersteller bevorzugt aus der eager-geladenen Assoziation lesen (kein N+1);
	// nur wenn nicht mitgeladen (z. B. direkt nach createFestival) einzeln nachladen.
	const createdBy = event.User
		? UserService.parseBackendUserToFrontend(convertToBackendUser(event.User.dataValues))
		: ((await UserService.loadFrontEndUserById(userId)) ?? null);
	return {
		id: event.id,
		name: event.name,
		bringYourOwnBottle: event.bringYourOwnBottle,
		bringYourOwnFood: event.bringYourOwnFood,
		createdAt: event.createdAt,
		createdBy: createdBy,
		description: event.description,
		startDate: event.startDate,
		location: event.location,
		updatedAt: event.updatedAt,
		frontendGuestInformation: event.EventGuests
			? await Promise.all(
					event.EventGuests.map((value) => {
						return mapToFrontendGuestInformation(value.dataValues);
					})
				)
			: []
	};
}

export async function mapToBackendFestivalEvent(event: FestivalEventAttributes): Promise<BackendFestivalEvent> {
	const userId = event.UserId;
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
		guestInformation: event.EventGuests
			? event.EventGuests.map((value) => {
					return mapToBackendGuestInformation(value.dataValues);
				})
			: []
	};
}
