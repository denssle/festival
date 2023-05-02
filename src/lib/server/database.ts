// In a real app, this data would live in a database,
// rather than in memory. But for now, we cheat.
import { FestivalEvent } from '../../routes/FestivalEvent';

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
	festivalEvents.push(new FestivalEvent(crypto.randomUUID(), name));
}