import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { FestivalEvent } from '$lib/models/FestivalEvent';

export const festivalEventWritable: Writable<FestivalEvent> = writable();