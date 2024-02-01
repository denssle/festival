import type { HandleClientError } from '@sveltejs/kit';

// https://kit.svelte.dev/docs/hooks
export const handleError = (async ({ error }) => {
	const errorId = crypto.randomUUID();
	console.error(error);
	return {
		message: 'Whoops!',
		errorId
	};
}) satisfies HandleClientError;
