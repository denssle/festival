import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const authorized: Writable<boolean> = writable(false);
