import { writable, Writable } from 'svelte/store';
import { FALLBACK_PICTURE } from '$lib/constants';

// Obergrenze für den clientseitigen Bild-Cache. Verhindert, dass die Map über
// die Lebensdauer der SPA hinweg mit jedem betrachteten Profil unbegrenzt wächst.
const MAX_CACHED_IMAGES = 50;

// LRU-Cache: Map behält die Einfügereihenfolge – der zuletzt genutzte Eintrag
// wird ans Ende sortiert, überzählige (älteste) Einträge vorne verworfen.
const map: Map<string, Writable<string>> = new Map<string, Writable<string>>();

export function getUserImageWritable(userId: string): Writable<string> {
	const existing: Writable<string> | undefined = map.get(userId);
	if (existing) {
		// Als zuletzt genutzt markieren: entfernen und wieder ans Ende einfügen.
		map.delete(userId);
		map.set(userId, existing);
		return existing;
	}
	const stringWritable: Writable<string> = writable('');
	map.set(userId, stringWritable);
	// Ältesten Eintrag verwerfen, sobald die Obergrenze überschritten ist.
	if (map.size > MAX_CACHED_IMAGES) {
		const oldest: string | undefined = map.keys().next().value;
		if (oldest !== undefined) {
			map.delete(oldest);
		}
	}
	return stringWritable;
}

export async function loadUserImage(userId: string): Promise<void> {
	const imageWritable: Writable<string> = getUserImageWritable(userId);
	try {
		const response = await fetch('/user-image/' + userId, { method: 'GET' });
		if (response.ok) {
			const text: string = await (await response.blob()).text();
			imageWritable.set(text);
		} else {
			imageWritable.set(FALLBACK_PICTURE);
		}
	} catch (reason) {
		console.error('loading picture error', reason);
		imageWritable.set(FALLBACK_PICTURE);
	}
}
