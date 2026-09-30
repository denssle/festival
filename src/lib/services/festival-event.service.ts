import type { FrontendFestivalEvent } from '../models/festivalEvent/FrontendFestivalEvent';
import type { BackendFestivalEvent } from '../models/festivalEvent/BackendFestivalEvent';
import type { FrontendUser } from '../models/user/FrontendUser';
import { UserService } from './user.service';
import {
	FestivalEventAttributes,
	FestivalEventCreationAttributes,
	mapToBackendFestivalEvent,
	mapToFrontendFestivalEvent
} from '$lib/db/attributes/festivalEvent.attributes';
import { Model, Op } from 'sequelize';
import { CurrentUser } from '$lib/models/user/CurrentUser';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { GuestInformationService } from '$lib/services/guest-information.service';
import { BackendGuestInformation } from '$lib/models/guestInformation/BackendGuestInformation';
import { VisitingFestival } from '$lib/models/user/VisitingFestival';
import { GuestInformation } from '$lib/db/model/guestInformation';
import { FestivalEvent } from '$lib/db/model/festivalEvent';
import { User } from '$lib/db/model/user';
import { canSeeFestival, isChangeAllowed } from './festival-event.logic';
import { FriendshipService } from './friendship.service';

export class FestivalEventService {
	/**
	 * Alle Festivals, die `userId` sehen darf. Dieselbe Regel wie `canSeeFestival`, nur als
	 * WHERE formuliert, damit nicht jedes Festival einzeln geprüft werden muss: eigene Festivals
	 * und die von Freunden, dazu alle, auf die der Nutzer schon geantwortet hat.
	 */
	static async getAllFestivals(userId: string): Promise<FrontendFestivalEvent[]> {
		const [friends, answers] = await Promise.all([
			FriendshipService.getFriends(userId),
			GuestInformation.findAll({ where: { UserId: userId }, attributes: ['FestivalEventId'] })
		]);
		const ownerIds: string[] = [
			userId,
			...friends.map((value) => (value.friend1Id === userId ? value.friend2Id : value.friend1Id))
		];
		const answeredFestivalIds: string[] = answers.map((value) => value.dataValues.FestivalEventId);

		const allFestivals = await FestivalEvent.findAll({
			where: {
				[Op.or]: [{ UserId: { [Op.in]: ownerIds } }, { id: { [Op.in]: answeredFestivalIds } }]
			},
			include: [
				{ model: GuestInformation, as: 'EventGuests' },
				// Ersteller mitladen, damit mapToFrontendFestivalEvent keinen
				// separaten Query pro Festival braucht (N+1 vermeiden).
				{ model: User, as: 'User' }
			],
			order: [['startDate', 'DESC']]
		});
		return Promise.all(
			allFestivals.map((value: Model<FestivalEventAttributes, FestivalEventCreationAttributes>) => {
				return mapToFrontendFestivalEvent(value.dataValues);
			})
		);
	}

	/**
	 * Darf `userId` das Festival sehen (und damit zu-/absagen und kommentieren)?
	 * Regel siehe `canSeeFestival`. Für ein nicht existierendes Festival `false` –
	 * Aufrufer antworten in beiden Fällen mit 404, damit fremde Festival-IDs nichts verraten.
	 */
	static async isVisibleTo(userId: string, festivalId: string): Promise<boolean> {
		const festival = await FestivalEvent.findByPk(festivalId, { attributes: ['UserId'] });
		if (!festival) {
			return false;
		}
		const ownerId: string = festival.dataValues.UserId;
		const [isFriend, answerCount] = await Promise.all([
			FriendshipService.areFriends(userId, ownerId),
			GuestInformation.count({ where: { UserId: userId, FestivalEventId: festivalId } })
		]);
		return canSeeFestival(userId, ownerId, isFriend, answerCount > 0);
	}

	private static async getFestivalModel(id: string) {
		return await FestivalEvent.findByPk(id, {
			include: { model: GuestInformation, as: 'EventGuests' }
		});
	}

	private static async getFestival(id: string): Promise<BackendFestivalEvent | null> {
		const mayBeFestival = await this.getFestivalModel(id);
		if (mayBeFestival) {
			return mapToBackendFestivalEvent(mayBeFestival.dataValues);
		}
		return null;
	}

	static async getFrontEndFestival(id: string): Promise<FrontendFestivalEvent | null> {
		const mayBeFestival: BackendFestivalEvent | null = await this.getFestival(id);
		if (mayBeFestival) {
			return await this.parseToFrontend(mayBeFestival);
		}
		return null;
	}

	static async createFestival(
		user: CurrentUser | null,
		name: string,
		description: string,
		startDate: number | null,
		bringYourOwnBottle: boolean,
		bringYourOwnFood: boolean,
		location: string
	): Promise<FrontendFestivalEvent | null> {
		if (user) {
			const model = await FestivalEvent.create({
				id: crypto.randomUUID(),
				name: name,
				description: description,
				UserId: user.id,
				// Wie in updateFestival: der Timestamp aus dem Formular wird zu einem Date
				// konvertiert (Spalte ist DataTypes.DATE).
				startDate: startDate ? new Date(startDate) : undefined,
				bringYourOwnBottle: bringYourOwnBottle,
				bringYourOwnFood: bringYourOwnFood,
				location: location
			});
			return await mapToFrontendFestivalEvent(model.dataValues);
		} else {
			console.warn('festival service: create: no user found');
		}
		return null;
	}

	static async updateFestival(
		user: CurrentUser | null,
		festivalId: string,
		name: string,
		description: string,
		startDate: number | null,
		bringYourOwnBottle: boolean,
		bringYourOwnFood: boolean,
		location: string
	): Promise<ChangeResult> {
		const festivalModel = await this.getFestivalModel(festivalId);
		if (festivalModel && user) {
			const ownerId = festivalModel.dataValues.UserId;
			if (isChangeAllowed(user.id, ownerId)) {
				festivalModel.set({
					name: name,
					description: description,
					startDate: startDate ? new Date(startDate) : undefined,
					bringYourOwnBottle: bringYourOwnBottle,
					bringYourOwnFood: bringYourOwnFood,
					location: location
				});
				await festivalModel.save();
				console.log('Festival updated in DB:', festivalModel.dataValues.name);
				return 'Success';
			} else {
				return 'Not authorized';
			}
		} else {
			return 'Data Missing';
		}
	}

	static async deleteFestival(user: CurrentUser | null, festivalId: string): Promise<ChangeResult> {
		const festivalModel = await this.getFestivalModel(festivalId);
		if (user && festivalModel) {
			const ownerId = festivalModel.dataValues.UserId;
			if (festivalModel && isChangeAllowed(user.id, ownerId)) {
				// Gäste und Kommentare hängen per FK-Kaskade am Festival (Kommentare seit Migration 0003).
				await festivalModel.destroy();
				return 'Success';
			} else {
				console.error('festival missing or not authorized', festivalModel, user.id);
				return 'Not authorized';
			}
		} else {
			console.error('user or festival id missing', user, festivalId);
			return 'Data Missing';
		}
	}

	private static async parseToFrontend(festival: BackendFestivalEvent): Promise<FrontendFestivalEvent | null> {
		const createdBy: FrontendUser | undefined = await UserService.loadFrontEndUserById(festival.UserId);
		return {
			id: festival.id,
			name: festival.name,
			description: festival.description,
			createdBy: createdBy ?? null,
			createdAt: festival.createdAt,
			updatedAt: festival.updatedAt,
			startDate: festival.startDate,
			bringYourOwnFood: festival.bringYourOwnFood,
			bringYourOwnBottle: festival.bringYourOwnBottle,
			frontendGuestInformation: await GuestInformationService.mapGuestInformationToFrontendGuestInformation(
				festival.guestInformation
			),
			location: festival.location
		};
	}

	/**
	 * Festivals, denen `userId` zugesagt hat – aus Sicht von `viewerId`. Auf dem Profil eines
	 * Freundes erscheinen nur die Festivals, die der Betrachter selbst sehen darf; sonst stünden
	 * dort Namen von Festivals fremder Leute, deren Link ohnehin ins 404 führt.
	 */
	static async getFestivalYouVisit(userId: string, viewerId: string): Promise<VisitingFestival[]> {
		const activeInfos: BackendGuestInformation[] = await GuestInformationService.getAllActiveGuestInformation(userId);

		// IDs sammeln, um Duplikate zu vermeiden
		const uniqueFestivalIds = [...new Set(activeInfos.map((info) => info.FestivalEventId))];
		const visible: boolean[] =
			viewerId === userId
				? uniqueFestivalIds.map(() => true)
				: await Promise.all(uniqueFestivalIds.map((id) => this.isVisibleTo(viewerId, id)));
		const festivalIds: string[] = uniqueFestivalIds.filter((_, i) => visible[i]);

		const loading: Promise<BackendFestivalEvent | null>[] = festivalIds.map((id) => this.getFestival(id));
		const result: VisitingFestival[] = [];
		for (const fest of await Promise.all(loading)) {
			if (fest !== null) {
				result.push({
					festivalId: fest.id,
					festivalName: fest.name
				});
			}
		}
		return result;
	}
}
