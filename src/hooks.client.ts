// https://kit.svelte.dev/docs/hooks
import type { HandleClientError } from "@sveltejs/kit";

export const handleError = (async ({ error, event }) => {
  const errorId = crypto.randomUUID();
  console.error(error);
  return {
    message: "Whoops!",
    errorId
  };
}) satisfies HandleClientError;