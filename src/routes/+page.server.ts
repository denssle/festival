import * as festivalController from "$lib/server/festival-event-controller";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../../.svelte-kit/types/src/routes/$types";
import type { FestivalEvent } from "../lib/models/FestivalEvent";

export const load = (({ cookies, request, locals }) => {
  console.log("locals", locals);
  const loaded: FestivalEvent[] = festivalController.get();
  console.log("root: return loaded events", loaded.length);
  return {
    loadedEvents: loaded.map((value) => {
      return { id: value.id, name: value.name };
    })
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ cookies, request }) => {
    const values = await request.formData();
    const name = values.get("name");
    console.log("default action!");
    if (name) {
      festivalController.create(String(name));
    }
    return { success: true, authorized: false };
  }
} satisfies Actions;