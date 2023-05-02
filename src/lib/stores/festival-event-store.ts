import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { FestivalEvent } from '../../routes/FestivalEvent';

export const festivalEventWritable: Writable<FestivalEvent> = writable(new FestivalEvent("undefined", "undefined"));