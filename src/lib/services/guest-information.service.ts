import type { BackendUser } from '$lib/models/user/BackendUser';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';
import {
	mapToBackendGuestInformation
} from '$lib/db/attributes/guestInformation.attributes';
import type { BackendGuestInformation } from '$lib/models/guestInformation/BackendGuestInformation';
import type { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';
import { UserService } from '$lib/services/user.service';
import { GuestInformation } from '$lib/db/model/guestInformation';

export class GuestInformationService {
	static async joinFestival(
		user: BackendUser | null | SessionTokenUser,
		festivalId: string,
		eventData: BaseGuestInformation
	): Promise<void> {
		if (user && festivalId) {
			const find = await this.getGuestInformationModel(user.id, festivalId);
			if (find) {
				await find.update({
					coming: true,
					comment: eventData.comment ?? '',
					food: eventData.food ?? '',
					drink: eventData.drink ?? '',
					numberOfOtherGuests: eventData.numberOfOtherGuests ?? 0
				});
			} else {
				await GuestInformation.create({
					id: crypto.randomUUID(),
					UserId: user.id,
					FestivalEventId: festivalId,
					coming: true,
					comment: eventData.comment ?? '',
					food: eventData.food ?? '',
					drink: eventData.drink ?? '',
					numberOfOtherGuests: eventData.numberOfOtherGuests ?? 0
				});
			}
		} else {
			throw new Error('User or FestivalId missing for joining');
		}
	}

	static async cancelInvitation(
		user: BackendUser | null | SessionTokenUser,
		festivalId: string,
		comment: string
	): Promise<void> {
		if (user && festivalId) {
			const guestInfoModel = await this.getGuestInformationModel(user.id, festivalId);
			if (guestInfoModel) {
				await guestInfoModel.update({
					coming: false,
					comment: comment ?? ''
				});
			} else {
				await GuestInformation.create({
					id: crypto.randomUUID(),
					FestivalEventId: festivalId,
					UserId: user.id,
					coming: false,
					comment: comment ?? '',
					numberOfOtherGuests: 0
				});
			}
		} else {
			throw new Error('User or FestivalId missing for leaving');
		}
	}

	static async mapGuestInformationToFrontendGuestInformation(
		guestInformation: BackendGuestInformation[]
	): Promise<FrontendGuestInformation[]> {
		const result: FrontendGuestInformation[] = [];
		for (const information of guestInformation) {
			const userId = information.UserId || (information as any).userId;
			const userById = await UserService.loadFrontEndUserById(userId);
			if (userById) {
				result.push({
					user: userById,
					coming: information.coming,
					numberOfOtherGuests: information.numberOfOtherGuests,
					drink: information.drink,
					comment: information.comment,
					food: information.food
				});
			}
		}
		return result;
	}

	private static async getGuestInformationModel(userId: string, festivalId: string) {
		return await GuestInformation.findOne({
			where: {
				FestivalEventId: festivalId,
				UserId: userId
			}
		});
	}

	static async getAllActiveGuestInformation(userId: string): Promise<BackendGuestInformation[]> {
		const infos = await GuestInformation.findAll({
			where: {
				UserId: userId,
				coming: true
			}
		});
		return infos.map((value) => mapToBackendGuestInformation(value.dataValues));
	}
}
