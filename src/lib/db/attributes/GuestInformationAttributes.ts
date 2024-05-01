import { BackendGuestInformation } from '$lib/models/guestInformation/BackendGuestInformation';
import { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';
import { loadFrontEndUserById } from '$lib/services/user-service';

export type GuestInformationAttributes = {
	id: string;
	festivalEventId: string;
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

export async function mapToFrontendGuestInformation(
	dataValues: GuestInformationAttributes
): Promise<FrontendGuestInformation> {
	return {
		coming: dataValues.coming,
		numberOfOtherGuests: dataValues.numberOfOtherGuests,
		drink: dataValues.drink,
		comment: dataValues.comment,
		food: dataValues.food,
		user: await loadFrontEndUserById(dataValues.UserId)
	};
}

export function mapToBackendGuestInformation(dataValues: GuestInformationAttributes): BackendGuestInformation {
	return {
		UserId: dataValues.UserId,
		FestivalEventId: dataValues.festivalEventId,
		food: dataValues.food,
		comment: dataValues.comment,
		drink: dataValues.drink,
		numberOfOtherGuests: dataValues.numberOfOtherGuests,
		coming: dataValues.coming
	};
}
