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
	convertToBackendFestivalEvent,
	convertToFrontendFestivalEvent
} from '$lib/db/attributes/FestivalEventAttributes';

export async function getAllFestivals(): Promise<FrontendFestivalEvent[]> {
	const allFestivals = await FestivalEvent.findAll({ include: GuestInformation });
	return Promise.all(
		allFestivals.map((value) => {
			return convertToFrontendFestivalEvent(value.dataValues);
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
		return convertToBackendFestivalEvent(mayBeFestival.dataValues);
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
	user: BackendUser | null,
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
			createdBy: user.id,
			startDate: startDate,
			bringYourOwnBottle: bringYourOwnBottle,
			bringYourOwnFood: bringYourOwnFood,
			location: location
		});
		return await convertToFrontendFestivalEvent(model.dataValues);
	} else {
		console.warn('festival service: create: no user found');
	}
	return null;
}

export async function updateFestival(
	user: BackendUser | null,
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

export async function deleteFestival(user: BackendUser | null, festivalId: string): Promise<void> {
	if (user && festivalId) {
		const festivalModel = await getFestivalModel(festivalId);
		if (festivalModel && festivalModel.dataValues.createdBy === user.id) {
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
			festivalEventId: festivalId,
			UserId: userId
		}
	});
}

export async function joinFestival(
	user: BackendUser | null,
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
				UserId: user.id,
				coming: true,
				comment: eventData.comment,
				food: eventData.food,
				drink: eventData.drink,
				numberOfOtherGuests: eventData.numberOfOtherGuests
			});
		}
	} else {
		console.log('joinFestival: no user and festivalId', user, festivalId);
	}
}

export async function leaveFestival(user: BackendUser | null, festivalId: string, comment: string): Promise<void> {
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
				UserId: user.id,
				coming: false,
				comment: comment,
				numberOfOtherGuests: 0
			});
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
		const userById = await loadFrontEndUserById(information.userId);
		if (userById) {
			result.push({ user: userById, ...information });
		}
	}
	return result;
}

async function parseToFrontend(festival: BackendFestivalEvent): Promise<FrontendFestivalEvent | null> {
	const createdBy: FrontendUser | undefined = await loadFrontEndUserById(festival.createdBy);
	if (createdBy) {
		const updatedBy: FrontendUser | undefined = await loadFrontEndUserById(festival.updatedBy);
		return {
			id: festival.id,
			name: festival.name,
			description: festival.description,
			createdBy: createdBy,
			createdAt: festival.createdAt,
			updatedBy: updatedBy ?? null,
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
