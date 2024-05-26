import type { BackendUser } from '$lib/models/user/BackendUser';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';
import { GuestInformation } from '$lib/db/db';
import { GuestInformationAttributes } from '$lib/db/attributes/guestInformation.attributes';
import type { BackendGuestInformation } from '$lib/models/guestInformation/BackendGuestInformation';
import type { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';
import { loadFrontEndUserById } from '$lib/services/user.service';

export async function joinFestival(
	user: BackendUser | null | SessionTokenUser,
	festivalId: string,
	eventData: BaseGuestInformation
): Promise<void> {
	if (user && festivalId) {
		const find = await getGuestInformationModel(user.id, festivalId);
		if (find) {
			find.set({
				coming: true,
				comment: eventData.comment,
				food: eventData.food,
				drink: eventData.drink,
				numberOfOtherGuests: eventData.numberOfOtherGuests
			});
			await find.save();
		} else {
			await GuestInformation.create({
				id: crypto.randomUUID(),
				UserId: user.id,
				coming: true,
				comment: eventData.comment,
				food: eventData.food,
				drink: eventData.drink,
				numberOfOtherGuests: eventData.numberOfOtherGuests,
				FestivalEventId: festivalId
			});
		}
	} else {
		console.log('joinFestival: no user and festivalId', user, festivalId);
	}
}

export async function leaveFestival(
	user: BackendUser | null | SessionTokenUser,
	festivalId: string,
	comment: string
): Promise<void> {
	if (user && festivalId) {
		const find = await getGuestInformationModel(user.id, festivalId);
		if (find) {
			find.set({
				coming: false,
				comment: comment
			});
			await find.save();
		} else {
			await GuestInformation.create({
				id: crypto.randomUUID(),
				FestivalEventId: festivalId,
				UserId: user.id,
				coming: false,
				comment: comment,
				numberOfOtherGuests: 0
			} as GuestInformationAttributes);
		}
	} else {
		console.log('leaveFestival: no user and festivalId', user, festivalId);
	}
}

export async function mapGuestInformationToFrontendGuestInformation(
	guestInformation: BackendGuestInformation[]
): Promise<FrontendGuestInformation[]> {
	const result: FrontendGuestInformation[] = [];
	for (const information of guestInformation) {
		const userById = await loadFrontEndUserById(information.UserId);
		if (userById) {
			result.push({ user: userById, ...information });
		}
	}
	return result;
}

async function getGuestInformationModel(userId: string, festivalId: string) {
	return await GuestInformation.findOne({
		where: {
			FestivalEventId: festivalId,
			UserId: userId
		}
	});
}
