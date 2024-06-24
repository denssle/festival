import { Actions, Cookies, redirect } from '@sveltejs/kit';
import { extractUser } from '$lib/services/user.service';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { createGroup } from '$lib/services/group.service';

export const actions: Actions = {
	default: async ({ cookies, request }: { cookies: Cookies; request: Request }): Promise<Response | undefined> => {
		const values: FormData = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		const user: SessionTokenUser | null = extractUser(cookies.get('session'));
		if (user && name) {
			const description: FormDataEntryValue | null = values.get('description');
			const newGroup = createGroup(user.id, name, description);
			/*
			TODO
			if (newGroup && newGroup.id) {
				redirect(302, '/group/' + newGroup?.id);
			}
			 */
		} else {
			return new Response(null, { status: 404 });
		}
	}
};