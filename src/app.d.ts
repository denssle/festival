// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { CurrentUser } from '$lib/models/user/CurrentUser';

declare global {
	namespace App {
		interface Locals {
			currentUser: CurrentUser | undefined;
		}

		// interface Error {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
