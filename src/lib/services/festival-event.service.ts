import type { FrontendFestivalEvent } from '../models/festivalEvent/FrontendFestivalEvent';
import type { BackendFestivalEvent } from '../models/festivalEvent/BackendFestivalEvent';
import type { BackendUser } from '../models/user/BackendUser';
import type { FrontendUser } from '../models/user/FrontendUser';
import { loadFrontEndUserById } from './user.service';
import { FestivalEvent, GuestInformation } from '$lib/db/db';
import {
	FestivalEventAttributes,
	mapToBackendFestivalEvent,
	mapToFrontendFestivalEvent
} from '$lib/db/attributes/festivalEvent.attributes';
import { Model } from 'sequelize';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { mapGuestInformationToFrontendGuestInformation } from '$lib/services/guest-information.service';

export async function getAllFestivals(): Promise<FrontendFestivalEvent[]> {
	const allFestivals = await FestivalEvent.findAll({ include: GuestInformation, order: [['startDate', 'DESC']] });
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
): Promise<ChangeResult> {
	const festivalModel = await getFestivalModel(festivalId);
	if (festivalModel && user) {
		if (isChangeAllowed(user.id, festivalModel.dataValues)) {
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

export async function deleteFestival(
	user: BackendUser | null | SessionTokenUser,
	festivalId: string
): Promise<ChangeResult> {
	const festivalModel = await getFestivalModel(festivalId);
	if (user && festivalModel) {
		if (festivalModel && isChangeAllowed(user.id, festivalModel.dataValues)) {
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

function isChangeAllowed(id: string, dataValues: FestivalEventAttributes): boolean {
	return id === dataValues.UserId;
}

function getFestivalYouVisit(userId: string) {
	FestivalEvent.findAll({
		include: GuestInformation,
		where: {}
	});
}
