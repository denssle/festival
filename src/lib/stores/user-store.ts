import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { User } from '$lib/models/User';

export const userStore: Writable<User> = writable<User>();