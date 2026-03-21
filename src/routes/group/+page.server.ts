import { type PageServerLoad } from './$types';
import { UserService } from '$lib/services/user.service';
import { Group } from '$lib/db/model/group';
import { GroupMember } from '$lib/db/model/groupMember';
import type { GroupAttributes } from '$lib/db/attributes/group.attributes';

export const load: PageServerLoad = async ({ cookies }) => {
	const user = UserService.extractUser(cookies.get('session'));
	if (!user) return { groups: [] };

	// Lade Gruppen, in denen der Benutzer Mitglied ist
	const members = await GroupMember.findAll({
		where: { UserId: user.id },
		include: [Group]
	});

	const groups = members.map((m: any) => m.Group?.dataValues as GroupAttributes).filter(Boolean);

	return {
		groups
	};
};
