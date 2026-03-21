import type { FrontendFestivalEvent } from '../models/festivalEvent/FrontendFestivalEvent';
import type { BackendFestivalEvent } from '../models/festivalEvent/BackendFestivalEvent';
import type { BackendUser } from '../models/user/BackendUser';
import type { FrontendUser } from '../models/user/FrontendUser';
import { UserService } from './user.service';
import {
	FestivalEventAttributes,
	mapToBackendFestivalEvent,
	mapToFrontendFestivalEvent
} from '$lib/db/attributes/festivalEvent.attributes';
import { Model } from 'sequelize';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { GuestInformationService } from '$lib/services/guest-information.service';
import { BackendGuestInformation } from '$lib/models/guestInformation/BackendGuestInformation';
import { VisitingFestival } from '$lib/models/user/VisitingFestival';
import { GuestInformation } from '$lib/db/model/guestInformation';
import { FestivalEvent } from '$lib/db/model/festivalEvent';

export class FestivalEventService {
	static async getAllFestivals(): Promise<FrontendFestivalEvent[]> {
		const allFestivals = await FestivalEvent.findAll({
			include: { model: GuestInformation, as: 'EventGuests' },
			order: [['startDate', 'DESC']]
		});
		return Promise.all(
			allFestivals.map((value: Model<FestivalEventAttributes, any>) => {
				return mapToFrontendFestivalEvent(value.dataValues);
			})
		);
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
		user: BackendUser | null | SessionTokenUser,
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
				startDate: startDate,
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
		user: BackendUser | null | SessionTokenUser,
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
			if (this.isChangeAllowed(user.id, festivalModel.dataValues)) {
				festivalModel.set({
					name: name,
					description: description,
					startDate: startDate ? new Date(startDate) : undefined,
					bringYourOwnBottle: bringYourOwnBottle,
					bringYourOwnFood: bringYourOwnFood,
					location: location
				});
				await festivalModel.save();
				return 'Success';
			} else {
				return 'Not authorized';
			}
		} else {
			return 'Data Missing';
		}
	}

	static async deleteFestival(user: BackendUser | null | SessionTokenUser, festivalId: string): Promise<ChangeResult> {
		const festivalModel = await this.getFestivalModel(festivalId);
		if (user && festivalModel) {
			if (festivalModel && this.isChangeAllowed(user.id, festivalModel.dataValues)) {
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

	private static isChangeAllowed(id: string, dataValues: FestivalEventAttributes): boolean {
		return id === dataValues.UserId;
	}

	static async getFestivalYouVisit(userId: string): Promise<VisitingFestival[]> {
		const activeInfos: BackendGuestInformation[] = await GuestInformationService.getAllActiveGuestInformation(userId);
		
		// IDs sammeln, um Duplikate zu vermeiden
		const uniqueFestivalIds = [...new Set(activeInfos.map(info => info.FestivalEventId))];
		
		const loading: Promise<BackendFestivalEvent | null>[] = uniqueFestivalIds.map((id) =>
			this.getFestival(id)
		);
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
