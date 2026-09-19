import { error, fail, redirect } from '@sveltejs/kit';
import { type PageServerLoad, type Actions } from './$types';
import { Group } from '$lib/db/model/group';
import { GroupMember } from '$lib/db/model/groupMember';
import { User } from '$lib/db/model/user';
import type { GroupAttributes } from '$lib/db/attributes/group.attributes';
import { convertToBackendUser, type UserAttributes } from '$lib/db/attributes/user.attributes';
import { UserService } from '$lib/services/user.service';
import { GroupService } from '$lib/services/group.service';
import { resolve } from '$app/paths';
import { t } from '$lib/i18n';
import { getMessageForChangeResult } from '$lib/models/updates/ChangeResult';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { group_id } = params;
	const user = locals.currentUser ?? null;

	const groupModel = await Group.findByPk(group_id);

	if (!groupModel) {
		throw error(404, t(locals.locale, 'group.error.notFound'));
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
	join: async ({ params, locals }) => {
		const { group_id } = params;
		const user = locals.currentUser ?? null;

		if (!user) {
			return fail(401, { success: false, message: t(locals.locale, 'error.notAuthenticated') });
		}

		const result = await GroupService.joinGroup(user.id, group_id);

		if (result === 'Success') {
			return { success: true, message: t(locals.locale, 'group.joined') };
		} else {
			return fail(400, { success: false, message: getMessageForChangeResult(locals.locale, result) });
		}
	},
	delete: async ({ params, locals }) => {
		const { group_id } = params;
		const user = locals.currentUser ?? null;

		if (!user) {
			return fail(401, { success: false, message: t(locals.locale, 'error.notAuthenticated') });
		}

		const result = await GroupService.deleteGroup(user.id, group_id);

		if (result === 'Success') {
			throw redirect(303, resolve('/group'));
		} else {
			return fail(400, { success: false, message: getMessageForChangeResult(locals.locale, result) });
		}
	},
	leave: async ({ params, locals }) => {
		const { group_id } = params;
		const user = locals.currentUser ?? null;

		if (!user) {
			return fail(401, { success: false, message: t(locals.locale, 'error.notAuthenticated') });
		}

		const result = await GroupService.leaveGroup(user.id, group_id);

		if (result === 'Success') {
			return { success: true, message: t(locals.locale, 'group.left') };
		} else {
			return fail(400, { success: false, message: getMessageForChangeResult(locals.locale, result) });
		}
	}
};
