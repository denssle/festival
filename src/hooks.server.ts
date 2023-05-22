// https://kit.svelte.dev/docs/hooks
import type { Handle, RequestEvent } from "@sveltejs/kit";
import * as userController from "$lib/server/user-controller";
import { authorized } from "./lib/stores/authorized-store";

export const handle = (async ({ event, resolve }): Promise<Response> => {
  const pathname: string = event.url.pathname;
  console.log("handle pathname", pathname);
  if (!pathname.startsWith("/login") && !pathname.startsWith("/registration")) {
    const sessionCookie: string | undefined = event.cookies.get("session");
    const valid: boolean = await userController.validateSessionToken(sessionCookie);
    authorized.set(true);
    console.log("handle session valid ", valid);
    if (valid) {
      const currentUser = userController.extractUser(sessionCookie);
      if (currentUser) {
        event.locals.currentUser = {
          isAuthenticated: true,
          email: currentUser.email
        };
      }
      return resolve(event);
    } else {
      return new Response("Redirect", { status: 303, headers: { Location: "/login" } });
    }
  }
  return resolve(event);
}) satisfies Handle;