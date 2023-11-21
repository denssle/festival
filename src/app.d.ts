// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { CurrentUser } from '$lib/models/CurrentUser';

declare global {
	namespace App {
		interface Locals {
			currentUser: CurrentUser;
		}

		// interface Error {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
