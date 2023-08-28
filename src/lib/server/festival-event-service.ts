import redis from '$lib/redis';
import type { FestivalEvent } from '$lib/models/FestivalEvent';

export function updateFestival(festivalId: string, name: string, description: string) {
	return redis.set(
		festivalId,
		JSON.stringify({
			id: festivalId,
			name: name,
			description: description
		})
	);
}

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
	const mayBeFestival: string | null = await redis.get(id);
	if (mayBeFestival) {
		return JSON.parse(mayBeFestival);
	}
	return null;
}

export function create(name: string, description: string): void {
	const newFestival: FestivalEvent = { id: `festival:${crypto.randomUUID()}`, name: name, description: description };
	redis.set(newFestival.id, JSON.stringify(newFestival));
}
