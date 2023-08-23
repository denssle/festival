import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export const authorized: Writable<boolean> = writable(false);
