import type { PageServerLoad } from '../../../../.svelte-kit/types/src/routes/festival/[festival_id]/$types';

export const load = (async ({ cookies, request, locals }) => {
	const festival_id: string | undefined = request.url.split('/').pop();
	console.log('festival url', festival_id);
	if (festival_id) {
	}
}) satisfies PageServerLoad;
