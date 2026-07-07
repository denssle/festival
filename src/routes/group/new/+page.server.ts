import { type Actions, type Cookies, fail, redirect } from '@sveltejs/kit';
import { UserService } from '$lib/services/user.service';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { GroupService } from '$lib/services/group.service';

export const actions: Actions = {
	default: async ({ cookies, request }: { cookies: Cookies; request: Request }) => {
		const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
		if (!user) {
			throw redirect(302, '/login');
		}

		const values: FormData = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		if (!name) {
			return fail(400, { message: 'Name is required' });
		}

		const description = values.get('description')?.toString() ?? '';
		const groupId = await GroupService.createGroup(user.id, String(name), description);
		redirect(302, `/group/${groupId}`);
	}
};
