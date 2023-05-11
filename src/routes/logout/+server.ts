import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST = (async ({ cookies, request }) => {
  await cookies.delete("session");
  throw redirect(302, "/login");
}) satisfies RequestHandler;