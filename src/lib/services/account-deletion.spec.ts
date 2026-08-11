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
import { UserService } from '$lib/services/user.service';

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

async function createComment(writtenBy: string, writtenTo: string): Promise<string> {
	const id = crypto.randomUUID();
	await Comment.create({ id, writtenBy, writtenTo, comment: 'text' });
	return id;
}

/**
 * Prüft die Kontolöschung (Art. 17 DSGVO) gegen die echte DB: Was verschwindet –
 * und ebenso wichtig, was von anderen Nutzern stehen bleibt.
 */
describe('Kontolöschung', () => {
	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		for (const model of Object.values(sequelize.models)) {
			await model.destroy({ where: {}, truncate: true, cascade: true });
		}
	});

	it('entfernt den Nutzer und alle kaskadierenden Daten', async () => {
		const userId = await createUser('deleteMe' + Date.now());
		const otherId = await createUser('other' + Date.now());

		await UserImage.create({ id: crypto.randomUUID(), UserId: userId, image: Buffer.from('img') });
		await SessionToken.create({ UserId: userId, token: 'token' });
		const ownFestival = await createFestival(userId);
		const foreignFestival = await createFestival(otherId);
		await GuestInformation.create({
			id: crypto.randomUUID(),
			UserId: userId,
			FestivalEventId: foreignFestival,
			coming: true,
			numberOfOtherGuests: 0
		});
		const groupId = crypto.randomUUID();
		await Group.create({ id: groupId, name: 'Gruppe', ownerId: userId });
		await GroupMember.create({ id: crypto.randomUUID(), GroupId: groupId, UserId: userId });
		await Friendship.create({ id: crypto.randomUUID(), friend1Id: userId, friend2Id: otherId });
		await FriendRequest.create({ id: crypto.randomUUID(), senderId: userId, receiverId: otherId });

		expect(await UserService.deleteAccount(userId)).toBe('Success');

		expect(await User.findByPk(userId)).toBeNull();
		expect(await UserImage.count({ where: { UserId: userId } })).toBe(0);
		expect(await SessionToken.count({ where: { UserId: userId } })).toBe(0);
		expect(await FestivalEvent.count({ where: { id: ownFestival } })).toBe(0);
		expect(await GuestInformation.count({ where: { UserId: userId } })).toBe(0);
		expect(await Group.count({ where: { ownerId: userId } })).toBe(0);
		expect(await GroupMember.count({ where: { UserId: userId } })).toBe(0);
		expect(await Friendship.count({ where: { friend1Id: userId } })).toBe(0);
		expect(await FriendRequest.count({ where: { senderId: userId } })).toBe(0);

		// Der andere Nutzer und sein Festival bleiben unangetastet.
		expect(await User.findByPk(otherId)).not.toBeNull();
		expect(await FestivalEvent.count({ where: { id: foreignFestival } })).toBe(1);
	});

	it('löscht Kommentare auf dem Profil des Nutzers (writtenTo, kein FK)', async () => {
		const userId = await createUser('profileTarget' + Date.now());
		const otherId = await createUser('commenter' + Date.now());

		await createComment(otherId, userId);

		expect(await UserService.deleteAccount(userId)).toBe('Success');

		expect(await Comment.count({ where: { writtenTo: userId } })).toBe(0);
	});

	it('löscht Kommentare an den Festivals des Nutzers', async () => {
		const userId = await createUser('festivalOwner' + Date.now());
		const otherId = await createUser('guest' + Date.now());
		const festivalId = await createFestival(userId);

		// Kommentar eines DRITTEN am Festival: hängt weder über writtenBy noch über
		// einen FK am gelöschten Nutzer und bliebe ohne die explizite Aufräumung übrig.
		await createComment(otherId, festivalId);

		expect(await UserService.deleteAccount(userId)).toBe('Success');

		expect(await Comment.count({ where: { writtenTo: festivalId } })).toBe(0);
	});

	it('löscht die vom Nutzer verfassten Kommentare, lässt fremde stehen', async () => {
		const userId = await createUser('author' + Date.now());
		const otherId = await createUser('bystander' + Date.now());
		const foreignFestival = await createFestival(otherId);

		await createComment(userId, foreignFestival);
		const foreignComment = await createComment(otherId, foreignFestival);

		expect(await UserService.deleteAccount(userId)).toBe('Success');

		expect(await Comment.count({ where: { writtenBy: userId } })).toBe(0);
		expect(await Comment.findByPk(foreignComment)).not.toBeNull();
	});

	it('meldet Data Missing für unbekannte oder fehlende IDs', async () => {
		expect(await UserService.deleteAccount(crypto.randomUUID())).toBe('Data Missing');
		expect(await UserService.deleteAccount('')).toBe('Data Missing');
	});
});
