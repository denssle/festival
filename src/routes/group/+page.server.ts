import { type PageServerLoad } from './$types';
import { Group } from '$lib/db/model/group';
import { GroupMember } from '$lib/db/model/groupMember';
import type { GroupAttributes } from '$lib/db/attributes/group.attributes';
import { GroupService } from '$lib/services/group.service';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.currentUser ?? null;
	const searchTerm = url.searchParams.get('q');

	let groups: GroupAttributes[] = [];
	let searchResults: GroupAttributes[] = [];

	if (user) {
		// Lade Gruppen, in denen der Benutzer Mitglied ist
		const members = await GroupMember.findAll({
			where: { UserId: user.id },
			include: [{ model: Group, as: 'Group' }]
		});

		groups = members
			.map((m) => m.dataValues.Group?.dataValues)
			.filter((group): group is GroupAttributes => group !== undefined);
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
