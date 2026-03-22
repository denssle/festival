import { type PageServerLoad } from './$types';
import { UserService } from '$lib/services/user.service';
import { Group } from '$lib/db/model/group';
import { GroupMember } from '$lib/db/model/groupMember';
import type { GroupAttributes } from '$lib/db/attributes/group.attributes';
import { GroupService } from '$lib/services/group.service';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const user = UserService.extractUser(cookies.get('session'));
	const searchTerm = url.searchParams.get('q');

	let groups: GroupAttributes[] = [];
	let searchResults: GroupAttributes[] = [];

	if (user) {
		// Lade Gruppen, in denen der Benutzer Mitglied ist
		const members = await GroupMember.findAll({
			where: { UserId: user.id },
			include: [{ model: Group, as: 'Group' }]
		});

		groups = members.map((m: any) => m.Group?.dataValues as GroupAttributes).filter(Boolean);
	}

	if (searchTerm) {
		searchResults = await GroupService.searchGroups(searchTerm);
	}

	return {
		groups,
		searchResults,
		searchTerm
	};
};
