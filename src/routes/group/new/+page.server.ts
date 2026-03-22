import { type Actions, Cookies, redirect } from '@sveltejs/kit';
import { UserService } from '$lib/services/user.service';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { GroupService } from '$lib/services/group.service';

export const actions: Actions = {
	default: async ({ cookies, request }: { cookies: Cookies; request: Request }): Promise<Response | undefined> => {
		const values: FormData = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
		if (user && name) {
			const description: FormDataEntryValue | null = values.get('description');
			const groupId = await GroupService.createGroup(user.id, name, description);
			redirect(302, `/group/${groupId}`);
		} else {
			return new Response(null, { status: 404 });
		}
	}
};
