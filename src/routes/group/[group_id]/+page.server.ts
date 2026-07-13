import { error, fail, redirect } from '@sveltejs/kit';
import { type PageServerLoad, type Actions } from './$types';
import { Group } from '$lib/db/model/group';
import { GroupMember } from '$lib/db/model/groupMember';
import { User } from '$lib/db/model/user';
import type { GroupAttributes } from '$lib/db/attributes/group.attributes';
import { convertToBackendUser, type UserAttributes } from '$lib/db/attributes/user.attributes';
import { UserService } from '$lib/services/user.service';
import { GroupService } from '$lib/services/group.service';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { group_id } = params;
	const user = UserService.extractUser(cookies.get('session'));

	const groupModel = await Group.findByPk(group_id);

	if (!groupModel) {
		throw error(404, 'Gruppe nicht gefunden');
	}

	const members = await GroupMember.findAll({
		where: { GroupId: group_id },
		include: [{ model: User, as: 'User' }]
	});

	const isMember = user ? members.some((m) => m.dataValues.UserId === user.id) : false;

	return {
		group: groupModel.dataValues as GroupAttributes,
		// Nur FrontendUser ausliefern: die rohen UserAttributes enthalten Passwort-Hash
		// und E-Mail und dürfen den Server nicht verlassen.
		members: members
			.map((m) => m.dataValues.User?.dataValues)
			.filter((attrs): attrs is UserAttributes => attrs !== undefined)
			.map((attrs) => UserService.parseBackendUserToFrontend(convertToBackendUser(attrs))),
		// Nur die für die UI nötigen Felder ausliefern – niemals das Session-Token an den Client geben
		currentUser: user ? { id: user.id, nickname: user.nickname } : null,
		isMember
	};
};

export const actions: Actions = {
	join: async ({ params, cookies }) => {
		const { group_id } = params;
		const user = UserService.extractUser(cookies.get('session'));

		if (!user) {
			return fail(401, { success: false, message: 'Nicht angemeldet' });
		}

		const result = await GroupService.joinGroup(user.id, group_id);

		if (result === 'Success') {
			return { success: true, message: 'Du bist der Gruppe erfolgreich beigetreten!' };
		} else {
			return fail(400, { success: false, message: result });
		}
	},
	delete: async ({ params, cookies }) => {
		const { group_id } = params;
		const user = UserService.extractUser(cookies.get('session'));

		if (!user) {
			return fail(401, { success: false, message: 'Nicht angemeldet' });
		}

		const result = await GroupService.deleteGroup(user.id, group_id);

		if (result === 'Success') {
			throw redirect(303, '/group');
		} else {
			return fail(400, { success: false, message: result });
		}
	},
	leave: async ({ params, cookies }) => {
		const { group_id } = params;
		const user = UserService.extractUser(cookies.get('session'));

		if (!user) {
			return fail(401, { success: false, message: 'Nicht angemeldet' });
		}

		const result = await GroupService.leaveGroup(user.id, group_id);

		if (result === 'Success') {
			return { success: true, message: 'Du hast die Gruppe verlassen.' };
		} else {
			return fail(400, { success: false, message: result });
		}
	}
};
