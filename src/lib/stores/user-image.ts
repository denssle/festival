import { writable, Writable } from 'svelte/store';
import { FALLBACK_PICTURE } from '$lib/constants';

const map: Map<string, Writable<string>> = new Map<string, Writable<string>>();

export function getUserImageWritable(userId: string): Writable<string> {
	if (map.has(userId)) {
		const newVar: Writable<string> | undefined = map.get(userId);
		if (newVar) {
			return newVar;
		}
	}
	const stringWritable: Writable<string> = writable('');
	map.set(userId, stringWritable);
	return stringWritable;
}

export function loadUserImage(userId: string): void {
	const imageWritable: Writable<string> = getUserImageWritable(userId);
	fetch('/user-image/' + userId, {
		method: 'GET'
	})
		.then((response) => {
			if (response.ok) {
				response
					.blob()
					.then((data) => {
						data.text().then((text: string) => {
							imageWritable.set(text);
						});
					})
					.catch((reason) => {
						console.log('read blob failed', reason);
					});
			} else {
				imageWritable.set(FALLBACK_PICTURE);
			}
		})
		.catch((reason) => {
			console.error('loading picture error', reason);
			imageWritable.set(FALLBACK_PICTURE);
		});
}
