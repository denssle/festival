import type { FrontendFestivalEvent } from '../models/festivalEvent/FrontendFestivalEvent';
import type { BackendFestivalEvent } from '../models/festivalEvent/BackendFestivalEvent';
import type { BackendUser } from '../models/user/BackendUser';
import type { FrontendUser } from '../models/user/FrontendUser';
import { loadFrontEndUserById } from './user-service';
import type { BackendGuestInformation } from '$lib/models/guestInformation/BackendGuestInformation';
import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';
import type { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';
import { FestivalEvent, GuestInformation } from '$lib/db/db';
import {
	FestivalEventAttributes,
	mapToBackendFestivalEvent,
	mapToFrontendFestivalEvent
} from '$lib/db/attributes/FestivalEventAttributes';
import { Model } from 'sequelize';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { GuestInformationAttributes } from '$lib/db/attributes/GuestInformationAttributes';

export async function getAllFestivals(): Promise<FrontendFestivalEvent[]> {
	const allFestivals = await FestivalEvent.findAll({ include: GuestInformation });
	return Promise.all(
		allFestivals.map((value: Model<FestivalEventAttributes, any>) => {
			return mapToFrontendFestivalEvent(value.dataValues);
		})
	);
}

async function getFestivalModel(id: string) {
	return await FestivalEvent.findByPk(id, {
		include: GuestInformation
	});
}

async function getFestival(id: string): Promise<BackendFestivalEvent | null> {
	const mayBeFestival = await getFestivalModel(id);
	if (mayBeFestival) {
		return mapToBackendFestivalEvent(mayBeFestival.dataValues);
	}
	return null;
}

export async function getFrontEndFestival(id: string): Promise<FrontendFestivalEvent | null> {
	const mayBeFestival: BackendFestivalEvent | null = await getFestival(id);
	if (mayBeFestival) {
		return await parseToFrontend(mayBeFestival);
	}
	return null;
}

export async function createFestival(
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

export async function updateFestival(
	user: BackendUser | null | SessionTokenUser,
	festivalId: string,
	name: string,
	description: string,
	startDate: number | null,
	bringYourOwnBottle: boolean,
	bringYourOwnFood: boolean,
	location: string
): Promise<void> {
	const festivalModel = await getFestivalModel(festivalId);
	if (festivalModel && user) {
		festivalModel.set({
			name: name,
			description: description,
			startDate: startDate ? new Date(startDate) : undefined,
			bringYourOwnBottle: bringYourOwnBottle,
			bringYourOwnFood: bringYourOwnFood,
			location: location
		});
		await festivalModel.save();
	} else {
		// TODO create new? throw error?
		console.error('updateFestival failed!');
	}
}

export async function deleteFestival(user: BackendUser | null | SessionTokenUser, festivalId: string): Promise<void> {
	if (user && festivalId) {
		const festivalModel = await getFestivalModel(festivalId);
		if (festivalModel && festivalModel.dataValues.UserId === user.id) {
			await festivalModel.destroy();
		} else {
			console.error('festival missing or not authorized', festivalModel, user.id);
		}
	} else {
		console.error('user or festival id missing', user, festivalId);
	}
}

async function getGuestInformationModel(userId: string, festivalId: string) {
	return await GuestInformation.findOne({
		where: {
			FestivalEventId: festivalId,
			UserId: userId
		}
	});
}

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

async function mapGuestInformationToFrontendGuestInformation(
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

async function parseToFrontend(festival: BackendFestivalEvent): Promise<FrontendFestivalEvent | null> {
	const createdBy: FrontendUser | undefined = await loadFrontEndUserById(festival.UserId);
	if (createdBy) {
		return {
			id: festival.id,
			name: festival.name,
			description: festival.description,
			createdBy: createdBy,
			createdAt: festival.createdAt,
			updatedAt: festival.updatedAt,
			startDate: festival.startDate,
			bringYourOwnFood: festival.bringYourOwnFood,
			bringYourOwnBottle: festival.bringYourOwnBottle,
			frontendGuestInformation: await mapGuestInformationToFrontendGuestInformation(festival.guestInformation),
			location: festival.location
		};
	}
	return null;
}
