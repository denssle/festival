import redis from '$lib/redis';
import type { FestivalEvent } from '$lib/models/FestivalEvent';
import type { User } from '$lib/models/User';

export async function getAllFestivals(): Promise<FestivalEvent[]> {
	const keys: string[] = await redis.keys('festival:*');
	const result: FestivalEvent[] = [];
	for (const key of keys) {
		if (key) {
			const newVar: string | null = await redis.get(key);
			if (newVar) {
				result.push(JSON.parse(newVar));
			}
		}
	}
	return result;
}

export async function getFestival(id: string): Promise<FestivalEvent | null> {
	const mayBeFestival: string | null = await redis.get(`festival:${id}`);
	if (mayBeFestival) {
		return JSON.parse(mayBeFestival);
	}
	return null;
}

export function create(user: User | null, name: string, description: string): void {
	if (user) {
		const newFestival: FestivalEvent = {
			id: crypto.randomUUID(),
			name: name,
			description: description,
			createdBy: user.id,
			createdAt: Date.now(),
			updatedBy: undefined,
			updatedAt: undefined
		};
		redis.set(`festival:${newFestival.id}`, JSON.stringify(newFestival));
	}
}

export async function updateFestival(user: User | null, festivalId: string, name: string, description: string) {
	const festival = await getFestival(festivalId);
	if (festival && user) {
		festival.name = name;
		festival.description = description;
		festival.updatedAt = Date.now();
		festival.updatedBy = user.id;
		return redis.set(`festival:${festivalId}`, JSON.stringify(festival));
	} else {
		// TODO create new?
	}
}
