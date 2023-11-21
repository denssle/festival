import type { PageServerLoad } from '../../.svelte-kit/types/src/routes/$types';

export const load: PageServerLoad = async ({ locals }: { locals: App.Locals }): Promise<App.Locals> => {
	return locals;
};
