import { error } from '@sveltejs/kit';
import { type PageServerLoad } from './$types';
import { Group } from '$lib/db/model/group';
import { GroupMember } from '$lib/db/model/groupMember';
import { User } from '$lib/db/model/user';
import type { GroupAttributes } from '$lib/db/attributes/group.attributes';
import { UserService } from '$lib/services/user.service';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { group_id } = params;
	const user = UserService.extractUser(cookies.get('session'));

	const groupModel = await Group.findByPk(group_id);

	if (!groupModel) {
		throw error(404, 'Gruppe nicht gefunden');
	}

	const members = await GroupMember.findAll({
		where: { GroupId: group_id },
		include: [User]
	});

	return {
		group: groupModel.dataValues as GroupAttributes,
		members: members.map((m: any) => m.User?.dataValues),
		currentUser: user
	};
};
