import type { FestivalListItem } from '$lib/models/FestivalListItem';
import redis from '$lib/redis';
import type { FestivalEvent } from '$lib/models/FestivalEvent';

export function getAllListItems(): FestivalListItem[] {
	return [];
}

export async function getFestival(id: string): Promise<FestivalEvent | null> {
	console.log('get', id);
	const mayBeFestival: string | null = await redis.get(id);
	if (mayBeFestival) {
		return JSON.parse(mayBeFestival);
	}
	return null;
}

export function create(name: string) {
	console.log('add new entry', name);
	const newFestival: FestivalEvent = { id: crypto.randomUUID(), name: name, description: '' };
	redis.set(newFestival.id, JSON.stringify(newFestival));
}
