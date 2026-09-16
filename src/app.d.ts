// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { CurrentUser } from '$lib/models/user/CurrentUser';
import type { Locale } from '$lib/i18n';

declare global {
	namespace App {
		interface Locals {
			currentUser: CurrentUser | undefined;
			/** Aktive Sprache, in `hooks.server.ts` aufgelöst (Cookie → Accept-Language → de). */
			locale: Locale;
		}

		// interface Error {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
