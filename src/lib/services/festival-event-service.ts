import type { FrontendFestivalEvent } from '../models/FrontendFestivalEvent';
import redis from '../redis';
import type { BackendFestivalEvent } from '../models/BackendFestivalEvent';
import type { BackendUser } from '../models/BackendUser';
import type { FrontendUser } from '../models/FrontendUser';
import { loadFrontEndUserById } from './user-service';
import { dateTimeToDate } from '../utils/dateUtils';
import type { GuestInformation } from '$lib/models/GuestInformation';

export async function getAllFestivals(): Promise<FrontendFestivalEvent[]> {
	const keys: string[] = await redis.keys('festival:*');
	const result: FrontendFestivalEvent[] = [];
	for (const key of keys) {
		if (key) {
			const festivalString: string | null = await redis.get(key);
			if (festivalString) {
				const loaded: FrontendFestivalEvent | null = await parseToFrontend(parseStringToFestival(festivalString));
				if (loaded) {
					result.push(loaded);
				}
			}
		}
	}
	return result;
}

export async function getFrontEndFestival(id: string): Promise<FrontendFestivalEvent | null> {
	const mayBeFestival: BackendFestivalEvent | null = await getFestival(id);
	if (mayBeFestival) {
		return await parseToFrontend(mayBeFestival);
	}
	return null;
}

async function getFestival(id: string): Promise<BackendFestivalEvent | null> {
	const mayBeFestival: string | null = await redis.get(`festival:${id}`);
	if (mayBeFestival) {
		return parseStringToFestival(mayBeFestival);
	}
	return null;
}

export async function create(
	user: BackendUser | null,
	name: string,
	description: string,
	startDate: number | null,
	bringYourOwnBottle: boolean,
	bringYourOwnFood: boolean
): Promise<FrontendFestivalEvent | null> {
	if (user) {
		const newFestival: BackendFestivalEvent = {
			id: crypto.randomUUID(),
			name: name,
			description: description,
			createdBy: user.id,
			createdAt: Date.now(),
			updatedBy: null,
			updatedAt: null,
			startDate: startDate,
			guestInformation: [],
			bringYourOwnBottle: bringYourOwnBottle,
			bringYourOwnFood: bringYourOwnFood
		};
		console.log('festival service: create: date: ', startDate);
		redis.set(`festival:${newFestival.id}`, parseFestivalToString(newFestival));
		return await parseToFrontend(newFestival);
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
	bringYourOwnFood: boolean
): Promise<'OK' | undefined> {
	const festival: BackendFestivalEvent | null = await getFestival(festivalId);
	if (festival && user) {
		festival.name = name;
		festival.description = description;
		festival.updatedAt = Date.now();
		festival.updatedBy = user.id;
		festival.startDate = startDate ? startDate : null;
		festival.bringYourOwnBottle = bringYourOwnBottle;
		festival.bringYourOwnFood = bringYourOwnFood;
		return redis.set(`festival:${festivalId}`, parseFestivalToString(festival));
	} else {
		// TODO create new? throw error?
		console.error('cration failed!!!');
	}
}

export async function deleteFestival(user: BackendUser | null, festivalId: string): Promise<void> {
	if (user && festivalId) {
		const festival: BackendFestivalEvent | null = await getFestival(festivalId);
		if (festival && festival.createdBy === user.id) {
			redis.del(`festival:${festivalId}`);
		} else {
			console.error('festival missing or not authorized', festival, user.id);
		}
	} else {
		console.error('user or festival id missing', user, festivalId);
	}
}

export async function joinFestival(user: BackendUser | null, festivalId: string): Promise<void> {
	if (user && festivalId) {
		const festival: BackendFestivalEvent | null = await getFestival(festivalId);
		if (festival) {
			if (isVisitor(festival, user.id)) {
				console.log('Can´t add user because already existing!');
			} else {
				festival.guestInformation.push({
					userId: user.id,
					additionalPeople: 0
				});
				redis.set(`festival:${festivalId}`, parseFestivalToString(festival));
			}
		}
	}
}

export async function leaveFestival(user: BackendUser | null, festivalId: string): Promise<void> {
	if (user && festivalId) {
		const festival: BackendFestivalEvent | null = await getFestival(festivalId);
		if (festival) {
			const find: GuestInformation | undefined = festival.guestInformation.find(value => value.userId === user.id);
			if (find) {
				festival.guestInformation.splice(festival.guestInformation.indexOf(find), 1);
				redis.set(`festival:${festivalId}`, parseFestivalToString(festival));
			}
		}
	}
}

function isVisitor(festival: BackendFestivalEvent, userId: string): boolean {
	return Boolean(festival.guestInformation.find(value => value.userId === userId));
}

export function isVisitorOfFestival(festival: FrontendFestivalEvent, user: BackendUser) {
	const find = festival.visitors.find((value) => value.id === user.id);
	return Boolean(find);
}

function parseFestivalToString(festival: BackendFestivalEvent): string {
	return JSON.stringify(festival);
}

function parseStringToFestival(festival: string): BackendFestivalEvent {
	const parse: BackendFestivalEvent = JSON.parse(festival);
	if (!parse.createdAt) {
		parse.createdAt = Date.now();
	}
	if (!parse.guestInformation) {
		parse.guestInformation = [];
	}
	return parse;
}

async function getVisitors(festival: BackendFestivalEvent): Promise<FrontendUser[]> {
	const filteredVisitors: FrontendUser[] = [];
	if (festival.guestInformation) {
		const visitors: (FrontendUser | undefined)[] = await Promise.all(
			festival.guestInformation
				.map((value: GuestInformation) => loadFrontEndUserById(value.userId))
				.filter(value => Boolean(value))
		);
		visitors.forEach((value) => {
			if (value && value.id) {
				filteredVisitors.push(value);
			}
		});
	}
	return filteredVisitors;
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
			createdAt: dateTimeToDate(festival.createdAt),
			updatedBy: updatedBy ?? null,
			updatedAt: dateTimeToDate(festival.updatedAt),
			startDate: dateTimeToDate(festival.startDate),
			visitors: await getVisitors(festival),
			bringYourOwnFood: festival.bringYourOwnFood,
			bringYourOwnBottle: festival.bringYourOwnBottle,
			guestInformation: festival.guestInformation
		};
	}
	return null;
}
