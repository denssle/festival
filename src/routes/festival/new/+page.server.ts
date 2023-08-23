import * as festivalController from "$lib/server/festival-event-controller";
import type { Actions } from "@sveltejs/kit";

export const actions = {
  default: async ({ cookies, request }) => {
    const values = await request.formData();
    const name: FormDataEntryValue | null = values.get("name");
    if (name) {
      const description: FormDataEntryValue | null = values.get("description");
      festivalController.create(String(name), String(description));
      return { success: true };
    } else {
      return { success: false };
    }
  }
} satisfies Actions;
