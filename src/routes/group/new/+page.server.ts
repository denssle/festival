import { type Actions, fail, redirect } from '@sveltejs/kit';
import { GroupService } from '$lib/services/group.service';
import { resolve } from '$app/paths';

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const user = locals.currentUser ?? null;
		if (!user) {
			throw redirect(302, resolve('/login'));
		}

		const values: FormData = await request.formData();
		const name: FormDataEntryValue | null = values.get('name');
		if (!name) {
			return fail(400, { message: 'Name is required' });
		}

		const description = values.get('description')?.toString() ?? '';
		const groupId = await GroupService.createGroup(user.id, String(name), description);
		redirect(302, resolve('/group/[group_id]', { group_id: groupId }));
	}
};
