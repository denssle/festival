import redis from '$lib/redis';
import type { BackendFestivalEvent } from '$lib/models/BackendFestivalEvent';
import type { BackendUser } from '$lib/models/BackendUser';
import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
import { numberToDate } from '$lib/utils/dateUtils';
import { loadFrontEndUserById } from '$lib/services/user-service';
import type { FrontendUser } from '$lib/models/FrontendUser';

export async function getAllFestivals(): Promise<FrontendFestivalEvent[]> {
	const keys: string[] = await redis.keys('festival:*');
	const result: FrontendFestivalEvent[] = [];
	for (const key of keys) {
		if (key) {
			const festivalString: string | null = await redis.get(key);
			if (festivalString) {
				result.push(await parseToFrontend(parseStringToFestival(festivalString)));
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
	startDate: number | null
): Promise<FrontendFestivalEvent | null> {
	if (user) {
		const newFestival: BackendFestivalEvent = {
			id: crypto.randomUUID(),
			name: name,
			description: description,
			createdBy: user.id,
			createdAt: Date.now(),
			updatedBy: undefined,
			updatedAt: undefined,
			startDate: startDate
		};
		redis.set(`festival:${newFestival.id}`, parseFestivalToString(newFestival));
		return await parseToFrontend(newFestival);
	}
	return null;
}

export async function updateFestival(user: BackendUser | null, festivalId: string, name: string, description: string) {
	const festival: BackendFestivalEvent | null = await getFestival(festivalId);
	if (festival && user) {
		festival.name = name;
		festival.description = description;
		festival.updatedAt = Date.now();
		festival.updatedBy = user.id;
		return redis.set(`festival:${festivalId}`, parseFestivalToString(festival));
	} else {
		// TODO create new? throw error?
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

function parseFestivalToString(festival: BackendFestivalEvent): string {
	return JSON.stringify(festival);
}

function parseStringToFestival(festival: string): BackendFestivalEvent {
	const parse: BackendFestivalEvent = JSON.parse(festival);
	if (!parse.createdAt) {
		parse.createdAt = Date.now();
	}
	return parse;
}

async function parseToFrontend(festival: BackendFestivalEvent): Promise<FrontendFestivalEvent> {
	const createdBy: FrontendUser | undefined = await loadFrontEndUserById(festival.createdBy);
	const updatedBy: FrontendUser | undefined = await loadFrontEndUserById(festival.updatedBy);
	return {
		id: festival.id,
		name: festival.name,
		description: festival.description,
		createdBy: createdBy,
		createdAt: numberToDate(festival.createdAt),
		updatedBy: updatedBy,
		updatedAt: numberToDate(festival.updatedAt),
		startDate: numberToDate(festival.startDate)
	};
}
