import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { sequelize } from '$lib/db/sequelize';
import { User } from '$lib/db/model/user';
import { FestivalEvent } from '$lib/db/model/festivalEvent';
import { GuestInformation } from '$lib/db/model/guestInformation';
import type { Answer } from '$lib/models/Answer';
import { FestivalEventService } from '$lib/services/festival-event.service';
import { FriendshipService } from '$lib/services/friendship.service';

async function createUser(nickname: string): Promise<string> {
	const id = crypto.randomUUID();
	await User.create({ id, nickname, password: 'hash', email: `${nickname}@example.com` });
	return id;
}

async function createFestival(ownerId: string, name: string): Promise<string> {
	const id = crypto.randomUUID();
	await FestivalEvent.create({ id, name, UserId: ownerId });
	return id;
}

async function answer(userId: string, festivalId: string, value: Answer): Promise<void> {
	await GuestInformation.create({
		id: crypto.randomUUID(),
		UserId: userId,
		FestivalEventId: festivalId,
		answer: value,
		numberOfOtherGuests: 0
	});
}

/**
 * Wer welches Festival sieht (Regel: `canSeeFestival`). `getAllFestivals` formuliert die
 * Regel als WHERE, `isVisibleTo` prüft einzeln – beide müssen für jeden Fall übereinstimmen.
 */
describe('Sichtbarkeit von Festivals', () => {
	let viewer: string;
	let friend: string;
	let stranger: string;
	const festivals: Record<string, string> = {};

	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		for (const model of Object.values(sequelize.models)) {
			await model.destroy({ where: {}, truncate: true, cascade: true });
		}
		viewer = await createUser('viewer');
		friend = await createUser('friend');
		stranger = await createUser('stranger');
		await FriendshipService.addFriend(friend, viewer);

		festivals.own = await createFestival(viewer, 'eigenes');
		festivals.friends = await createFestival(friend, 'vom Freund');
		festivals.strangers = await createFestival(stranger, 'vom Fremden');
		festivals.answeredNo = await createFestival(stranger, 'vom Fremden, abgesagt');
		await answer(viewer, festivals.answeredNo, 'no');
	});

	it('zeigt auf der Startseite genau die sichtbaren Festivals', async () => {
		const names = (await FestivalEventService.getAllFestivals(viewer)).map((f) => f.name).sort();
		expect(names).toEqual(['eigenes', 'vom Fremden, abgesagt', 'vom Freund']);
	});

	it('entscheidet einzeln genauso wie die Startseite', async () => {
		expect(await FestivalEventService.isVisibleTo(viewer, festivals.own)).toBe(true);
		expect(await FestivalEventService.isVisibleTo(viewer, festivals.friends)).toBe(true);
		expect(await FestivalEventService.isVisibleTo(viewer, festivals.answeredNo)).toBe(true);
		expect(await FestivalEventService.isVisibleTo(viewer, festivals.strangers)).toBe(false);
	});

	it('wertet die Freundschaft in beide Richtungen', async () => {
		// addFriend(friend, viewer) legt friend als friend1Id an – der Freund sieht umgekehrt auch.
		expect(await FestivalEventService.isVisibleTo(friend, festivals.own)).toBe(true);
		const names = (await FestivalEventService.getAllFestivals(friend)).map((f) => f.name);
		expect(names).toContain('eigenes');
	});

	it('meldet ein nicht vorhandenes Festival als unsichtbar', async () => {
		expect(await FestivalEventService.isVisibleTo(viewer, crypto.randomUUID())).toBe(false);
	});

	it('zeigt auf dem Profil eines Freundes nur Zusagen, die der Betrachter sehen darf', async () => {
		await answer(friend, festivals.friends, 'yes');
		await answer(friend, festivals.strangers, 'yes');

		const seenByViewer = await FestivalEventService.getFestivalYouVisit(friend, viewer);
		expect(seenByViewer.map((f) => f.festivalName)).toEqual(['vom Freund']);

		const seenBySelf = await FestivalEventService.getFestivalYouVisit(friend, friend);
		expect(seenBySelf.map((f) => f.festivalName).sort()).toEqual(['vom Fremden', 'vom Freund']);
	});
});
