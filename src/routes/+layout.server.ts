import type { PageServerLoad } from '../../.svelte-kit/types/src/routes/$types';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const load = (({ locals }) => {
	return locals;
}) satisfies PageServerLoad;
