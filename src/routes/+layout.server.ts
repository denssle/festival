import type { PageServerLoad } from '../../.svelte-kit/types/src/routes/$types';

// @ts-ignore
export const load = (({ locals }) => {
	return locals;
}) satisfies PageServerLoad;
