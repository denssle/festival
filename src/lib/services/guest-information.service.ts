import { CurrentUser } from '$lib/models/user/CurrentUser';
import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';
import { mapToBackendGuestInformation } from '$lib/db/attributes/guestInformation.attributes';
import type { BackendGuestInformation } from '$lib/models/guestInformation/BackendGuestInformation';
import type { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';
import { UserService } from '$lib/services/user.service';
import { GuestInformation } from '$lib/db/model/guestInformation';
import type { CommentAnswer } from '$lib/models/Answer';

export class GuestInformationService {
	static async joinFestival(
		user: CurrentUser | null,
		festivalId: string,
		eventData: BaseGuestInformation
	): Promise<void> {
		if (user && festivalId) {
			const find = await this.getGuestInformationModel(user.id, festivalId);
			if (find) {
				await find.update({
					answer: 'yes',
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
					answer: 'yes',
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

	/**
	 * Antwort mit Kommentar statt Mitbring-Angaben: „nicht dabei“ oder „vielleicht“.
	 * Essen, Trinken und Begleitung einer früheren Zusage bleiben stehen – sagt der Gast
	 * wieder zu, sind sie im Dialog vorbefüllt; angezeigt werden sie nur bei einer Zusage.
	 */
	static async answerWithComment(
		user: CurrentUser | null,
		festivalId: string,
		answer: CommentAnswer,
		comment: string
	): Promise<void> {
		if (user && festivalId) {
			const guestInfoModel = await this.getGuestInformationModel(user.id, festivalId);
			if (guestInfoModel) {
				await guestInfoModel.update({
					answer: answer,
					comment: comment ?? ''
				});
			} else {
				await GuestInformation.create({
					id: crypto.randomUUID(),
					FestivalEventId: festivalId,
					UserId: user.id,
					answer: answer,
					comment: comment ?? '',
					numberOfOtherGuests: 0
				});
			}
		} else {
			throw new Error('User or FestivalId missing for answering');
		}
	}

	static async mapGuestInformationToFrontendGuestInformation(
		guestInformation: BackendGuestInformation[]
	): Promise<FrontendGuestInformation[]> {
		const mapped = await Promise.all(
			guestInformation.map(async (information) => {
				const userId = information.UserId;
				const userById = await UserService.loadFrontEndUserById(userId);
				if (userById) {
					return {
						user: userById,
						answer: information.answer,
						numberOfOtherGuests: information.numberOfOtherGuests,
						drink: information.drink,
						comment: information.comment,
						food: information.food
					} as FrontendGuestInformation;
				}
				return null;
			})
		);
		return mapped.filter((item): item is FrontendGuestInformation => item !== null);
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
				// Nur Zusagen: „Festivals, zu denen ich gehe“ – ein Vielleicht zählt nicht (2026-09-25).
				answer: 'yes'
			}
		});
		return infos.map((value) => mapToBackendGuestInformation(value.dataValues));
	}
}
