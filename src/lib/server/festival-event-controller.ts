import type { FestivalEvent } from '$lib/models/FestivalEvent';


const festivalEvents: FestivalEvent[] = [{
	id: crypto.randomUUID(),
	name: 'From Backend',
	error: false
}
];

export function get(): FestivalEvent[] {
	return festivalEvents;
}

export function create(name: string) {
	console.log('add new entry', name);
	festivalEvents.push({ id: crypto.randomUUID(), name: name, error: false });
}