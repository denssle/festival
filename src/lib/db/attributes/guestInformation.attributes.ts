import { BackendGuestInformation } from '$lib/models/guestInformation/BackendGuestInformation';
import { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';
import { UserService } from '$lib/services/user.service';
import type { Optional } from 'sequelize';

export type GuestInformationAttributes = {
	id: string;
	food: string;
	drink: string;
	numberOfOtherGuests: number;
	coming: boolean;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
	FestivalEventId: string;
	UserId: string;
};

/** Attribute beim Anlegen: Pflicht sind nur `id`, `FestivalEventId` und `UserId`. */
export type GuestInformationCreationAttributes = Optional<
	GuestInformationAttributes,
	'createdAt' | 'updatedAt' | 'food' | 'drink' | 'numberOfOtherGuests' | 'coming' | 'comment'
>;

export async function mapToFrontendGuestInformation(
	dataValues: GuestInformationAttributes
): Promise<FrontendGuestInformation> {
	return {
		coming: dataValues.coming,
		numberOfOtherGuests: dataValues.numberOfOtherGuests,
		drink: dataValues.drink,
		comment: dataValues.comment,
		food: dataValues.food,
		user: await UserService.loadFrontEndUserById(dataValues.UserId)
	};
}

export function mapToBackendGuestInformation(dataValues: GuestInformationAttributes): BackendGuestInformation {
	return {
		UserId: dataValues.UserId,
		FestivalEventId: dataValues.FestivalEventId,
		food: dataValues.food,
		comment: dataValues.comment,
		drink: dataValues.drink,
		numberOfOtherGuests: dataValues.numberOfOtherGuests,
		coming: dataValues.coming
	};
}
