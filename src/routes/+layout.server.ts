import type { PageServerLoad } from "../../.svelte-kit/types/src/routes/$types";

export const load = (({ locals }) => {
  console.log("layout load", locals);
  return locals;
}) satisfies PageServerLoad;