import * as userController from "$lib/server/user-controller";
import type { Actions, Cookies } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import type { User } from "$lib/models/User";
import type { PageServerLoad } from "../../../.svelte-kit/types/src/routes/$types";

export const load = (async ({ cookies, request }) => {
  console.log("login cookies: ", cookies.get("session"));
  const valid = await userController.validateSessionToken(cookies.get("session"));
  if (valid) {
    console.log("login session token valid");
    throw redirect(303, "/");
  }
  console.log("login session token invalid");
  return {
    success: true,
    authorized: false
  };
}) satisfies PageServerLoad;


export const actions = {
  default: async ({ cookies, request }) => {
    const values: FormData = await request.formData();
    const emailValue: FormDataEntryValue | null = values.get("email");
    const passwordValue: FormDataEntryValue | null = values.get("password");
    console.log("login default action: ", emailValue, passwordValue);
    if (emailValue && passwordValue) {
      const user: User | null = await userController.login(emailValue.toString(), passwordValue.toString());
      if (user) {
        cookies.set("session", JSON.stringify(user), {
          path: "/",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30
        });
        throw redirect(302, "/");
      }
    }
    return { success: false, authorized: false, errorMessage: "Password and / or Email missing" };
  }
} satisfies Actions;