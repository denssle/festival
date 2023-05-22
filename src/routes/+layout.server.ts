import type { PageServerLoad } from "../../.svelte-kit/types/src/routes/$types";

export const load = (({ locals }) => {
  return locals;
}) satisfies PageServerLoad;