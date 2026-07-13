import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { sequelize } from '$lib/db/sequelize';
import { User } from '$lib/db/model/user';
import { UserImage } from '$lib/db/model/userImage';
import { SessionToken } from '$lib/db/model/sessionToken';
import { FestivalEvent } from '$lib/db/model/festivalEvent';
import { GuestInformation } from '$lib/db/model/guestInformation';
import { Group } from '$lib/db/model/group';
import { GroupMember } from '$lib/db/model/groupMember';
import { FriendRequest } from '$lib/db/model/friendRequest';
import { Friendship } from '$lib/db/model/friendship';
import { Comment } from '$lib/db/model/comment';
import { FestivalEventService } from '$lib/services/festival-event.service';
import { GroupService } from '$lib/services/group.service';
import { FriendshipService } from '$lib/services/friendship.service';
import { CommentService } from '$lib/services/comment.service';

async function createUser(nickname: string): Promise<string> {
	const id = crypto.randomUUID();
	await User.create({ id, nickname, password: 'hash', email: `${nickname}@example.com` });
	return id;
}

async function createFestival(ownerId: string): Promise<string> {
	const id = crypto.randomUUID();
	await FestivalEvent.create({ id, name: 'Festival ' + id, UserId: ownerId });
	return id;
}

/**
 * Verifiziert die in db.ts definierten Beziehungen gegen die echte DB:
 * Welche Datensätze verschwinden beim Löschen eines Elternobjekts – und welche nicht.
 */
describe('Beziehungen & Kaskadenlöschungen', () => {
	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		for (const model of Object.values(sequelize.models)) {
			await model.destroy({ where: {}, truncate: true, cascade: true });
		}
	});

	it('löscht beim Entfernen eines Users alle abhängigen Datensätze', async () => {
		const userId = await createUser('owner' + Date.now());
		const otherId = await createUser('other' + Date.now());

		await UserImage.create({ id: crypto.randomUUID(), UserId: userId, image: 'data:image/png;base64,AA' });
		await SessionToken.create({ UserId: userId, token: 'token' });
		const festivalId = await createFestival(userId);
		await GuestInformation.create({
			id: crypto.randomUUID(),
			UserId: userId,
			FestivalEventId: festivalId,
			coming: true,
			numberOfOtherGuests: 0
		});
		const groupId = crypto.randomUUID();
		await Group.create({ id: groupId, name: 'Gruppe', ownerId: userId });
		await GroupMember.create({ id: crypto.randomUUID(), GroupId: groupId, UserId: userId });
		await FriendRequest.create({ id: crypto.randomUUID(), senderId: userId, receiverId: otherId });
		await Friendship.create({ id: crypto.randomUUID(), friend1Id: otherId, friend2Id: userId });
		await CommentService.saveComment(userId, otherId, 'Hallo');

		await User.destroy({ where: { id: userId } });

		expect(await UserImage.count()).toBe(0);
		expect(await SessionToken.count()).toBe(0);
		expect(await FestivalEvent.count()).toBe(0);
		expect(await GuestInformation.count()).toBe(0);
		expect(await Group.count()).toBe(0);
		expect(await GroupMember.count()).toBe(0);
		expect(await FriendRequest.count()).toBe(0);
		// friendships kaskadiert über BEIDE Spalten (hier steht der User in friend2Id)
		expect(await Friendship.count()).toBe(0);
		// Kommentare des Users kaskadieren über writtenBy
		expect(await Comment.count()).toBe(0);
	});

	it('löscht beim Entfernen eines Festivals Gäste und Festival-Kommentare', async () => {
		const ownerId = await createUser('fowner' + Date.now());
		const guestId = await createUser('fguest' + Date.now());
		const festivalId = await createFestival(ownerId);
		const otherFestivalId = await createFestival(ownerId);

		await GuestInformation.create({
			id: crypto.randomUUID(),
			UserId: guestId,
			FestivalEventId: festivalId,
			coming: true,
			numberOfOtherGuests: 0
		});
		await CommentService.saveComment(guestId, festivalId, 'Bin dabei');
		await CommentService.saveComment(guestId, otherFestivalId, 'Anderes Festival');

		const result = await FestivalEventService.deleteFestival({ id: ownerId } as any, festivalId);

		expect(result).toBe('Success');
		expect(await GuestInformation.count()).toBe(0);
		// Kommentare des gelöschten Festivals sind weg, die des anderen bleiben
		expect(await Comment.count()).toBe(1);
		expect(await Comment.count({ where: { writtenTo: otherFestivalId } })).toBe(1);
	});

	it('löscht beim Entfernen einer Gruppe deren Mitgliedschaften', async () => {
		const ownerId = await createUser('gowner' + Date.now());
		const memberId = await createUser('gmember' + Date.now());
		const groupId = crypto.randomUUID();
		await Group.create({ id: groupId, name: 'Gruppe', ownerId: ownerId });
		await GroupMember.create({ id: crypto.randomUUID(), GroupId: groupId, UserId: memberId });

		expect(await GroupService.deleteGroup(ownerId, groupId)).toBe('Success');
		expect(await GroupMember.count()).toBe(0);
	});

	it('legt keine gespiegelte Doppel-Freundschaft an', async () => {
		const a = await createUser('fa' + Date.now());
		const b = await createUser('fb' + Date.now());

		await FriendshipService.addFriend(a, b);
		await FriendshipService.addFriend(b, a);
		await FriendshipService.addFriend(a, a);

		expect(await Friendship.count()).toBe(1);
		expect(await FriendshipService.areFriends(b, a)).toBe(true);
	});
});
