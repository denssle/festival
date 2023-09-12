import redis from '$lib/redis';
import type { FestivalEvent } from '$lib/models/FestivalEvent';
import type { User } from '$lib/models/User';

export async function getAllFestivals(): Promise<FestivalEvent[]> {
	const keys: string[] = await redis.keys('festival:*');
	const result: FestivalEvent[] = [];
	for (const key of keys) {
		if (key) {
			const festivalString: string | null = await redis.get(key);
			if (festivalString) {
				result.push(parseStringToFestival(festivalString));
			}
		}
	}
	return result;
}

export async function getFestival(id: string): Promise<FestivalEvent | null> {
	const mayBeFestival: string | null = await redis.get(`festival:${id}`);
	if (mayBeFestival) {
		return parseStringToFestival(mayBeFestival);
	}
	return null;
}

export function create(user: User | null, name: string, description: string, startDate: number): FestivalEvent | null {
	if (user) {
		const newFestival: FestivalEvent = {
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
		return newFestival;
	}
	return null;
}

export async function updateFestival(user: User | null, festivalId: string, name: string, description: string) {
	const festival = await getFestival(festivalId);
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

export async function deleteFestival(user: User | null, festivalId: string) {
	if (user && festivalId) {
		const festival = await getFestival(festivalId);
		if (festival && festival.createdBy === user.id) {
			redis.del(`festival:${festivalId}`);
		} else {
			console.error('festival missing or not authorized', festival, user.id);
		}
	} else {
		console.error('user or festival id missing', user, festivalId);
	}
}

function parseFestivalToString(festival: FestivalEvent): string {
	return JSON.stringify(festival);
}

function parseStringToFestival(festival: string): FestivalEvent {
	const parse: FestivalEvent = JSON.parse(festival);
	if (!parse.createdAt) {
		parse.createdAt = Date.now();
	}
	return parse;
}
