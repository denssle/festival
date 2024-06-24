import { Group, GroupMember } from '$lib/db/db';

export function createGroup(userId: string, name: File | string, description: FormDataEntryValue | null) {
	const groupId = crypto.randomUUID();
	Group.create({
		id: groupId,
		name: name,
		description: description,
		UserId: userId
	}).then(() => {
		GroupMember.create({
			id: crypto.randomUUID(),
			// Userid
			GroupId: groupId
		});
	});
}