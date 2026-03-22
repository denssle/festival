import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Group } from '$lib/db/model/group';
import type { GroupAttributes } from '$lib/db/attributes/group.attributes';
import { UserService } from '$lib/services/user.service';
import { GroupService } from '$lib/services/group.service';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { group_id } = params;
	const user = UserService.extractUser(cookies.get('session'));

	if (!user) {
		throw redirect(302, '/login');
	}

	const groupModel = await Group.findByPk(group_id);

	if (!groupModel) {
		throw error(404, 'Gruppe nicht gefunden');
	}

	const group = groupModel.dataValues as GroupAttributes;

	if (group.ownerId !== user.id) {
		throw error(403, 'Nicht autorisiert');
	}

	return {
		group,
		currentUser: user
	};
};

export const actions: Actions = {
	default: async ({ params, cookies, request }) => {
		const { group_id } = params;
		const user = UserService.extractUser(cookies.get('session'));

		if (!user) {
			return fail(401, { message: 'Nicht angemeldet' });
		}

		const data = await request.formData();
		const name = data.get('name') as string;
		const description = data.get('description') as string;

		if (!name) {
			return fail(400, { message: 'Name ist erforderlich' });
		}

		const result = await GroupService.updateGroup(user.id, group_id, name, description);

		if (result === 'Success') {
			throw redirect(303, `/group/${group_id}`);
		} else {
			return fail(400, { message: result });
		}
	}
};
