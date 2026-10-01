import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { FriendRequest } from '$lib/db/model/friendRequest';
import { Friendship } from '$lib/db/model/friendship';
import { createUser, resetDatabase } from '$lib/db/test-fixtures';
import { FriendshipService } from '$lib/services/friendship.service';

/**
 * Freundschaftsanfragen sind gerichtet (Absender → Empfänger), Freundschaften nicht.
 * Geprüft wird, wer was darf und dass keine doppelten oder gespiegelten Zeilen entstehen.
 */
describe('FriendshipService', () => {
	let anna: string;
	let ben: string;
	let carla: string;

	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		await resetDatabase();
		anna = await createUser('anna');
		ben = await createUser('ben');
		carla = await createUser('carla');
	});

	describe('Anfrage stellen', () => {
		it('legt eine gerichtete Anfrage an', async () => {
			await FriendshipService.createFriendRequest(anna, ben);

			expect(await FriendshipService.receivedFriendRequestExists(ben, anna)).toBe(true);
			expect(await FriendshipService.receivedFriendRequestExists(anna, ben)).toBe(false);
			expect((await FriendshipService.getSentFriendRequests(anna)).map((r) => r.sendTo?.id)).toEqual([ben]);
			expect((await FriendshipService.getReceivedFriendRequests(ben)).map((r) => r.receivedFrom?.id)).toEqual([anna]);
		});

		it('ignoriert Anfragen an sich selbst', async () => {
			await FriendshipService.createFriendRequest(anna, anna);
			expect(await FriendRequest.count()).toBe(0);
		});

		it('legt keine zweite Anfrage an – auch nicht in Gegenrichtung', async () => {
			await FriendshipService.createFriendRequest(anna, ben);
			await FriendshipService.createFriendRequest(anna, ben);
			// Bestehendes Verhalten: Die Gegenanfrage wird weder angelegt noch als Annahme
			// gewertet – Ben muss Annas Anfrage über die Updates-Seite annehmen.
			await FriendshipService.createFriendRequest(ben, anna);

			expect(await FriendRequest.count()).toBe(1);
			expect(await FriendshipService.areFriends(anna, ben)).toBe(false);
		});

		it('legt unter Freunden keine Anfrage an', async () => {
			await FriendshipService.addFriend(anna, ben);
			await FriendshipService.createFriendRequest(ben, anna);
			expect(await FriendRequest.count()).toBe(0);
		});
	});

	describe('Anfrage annehmen', () => {
		it('macht Absender und Empfänger zu Freunden und räumt die Anfrage weg', async () => {
			await FriendshipService.createFriendRequest(anna, ben);
			await FriendshipService.acceptFriendRequest(ben, anna);

			expect(await FriendshipService.areFriends(anna, ben)).toBe(true);
			expect(await FriendshipService.areFriends(ben, anna)).toBe(true);
			expect(await FriendRequest.count()).toBe(0);
		});

		it('der Absender kann seine eigene Anfrage nicht annehmen', async () => {
			await FriendshipService.createFriendRequest(anna, ben);
			await FriendshipService.acceptFriendRequest(anna, ben);

			expect(await FriendshipService.areFriends(anna, ben)).toBe(false);
			expect(await FriendRequest.count()).toBe(1);
		});

		it('ohne Anfrage entsteht keine Freundschaft', async () => {
			await FriendshipService.acceptFriendRequest(ben, carla);
			expect(await Friendship.count()).toBe(0);
		});
	});

	describe('Anfrage ablehnen und zurückziehen', () => {
		it('ablehnen entfernt die Anfrage ohne Freundschaft', async () => {
			await FriendshipService.createFriendRequest(anna, ben);
			await FriendshipService.declineFriendRequest(ben, anna);

			expect(await FriendRequest.count()).toBe(0);
			expect(await FriendshipService.areFriends(anna, ben)).toBe(false);
		});

		it('zurückziehen entfernt die Anfrage', async () => {
			await FriendshipService.createFriendRequest(anna, ben);
			await FriendshipService.cancelFriendRequest(anna, ben);
			expect(await FriendRequest.count()).toBe(0);
		});

		it('lässt Anfragen anderer stehen', async () => {
			await FriendshipService.createFriendRequest(anna, ben);
			await FriendshipService.createFriendRequest(carla, ben);
			await FriendshipService.declineFriendRequest(ben, anna);

			expect((await FriendshipService.getReceivedFriendRequests(ben)).map((r) => r.receivedFrom?.id)).toEqual([carla]);
		});
	});

	describe('Freundschaft', () => {
		it('legt keine gespiegelte zweite Zeile an', async () => {
			await FriendshipService.addFriend(anna, ben);
			await FriendshipService.addFriend(ben, anna);
			expect(await Friendship.count()).toBe(1);
		});

		it('die Freundesliste gilt in beide Richtungen', async () => {
			await FriendshipService.addFriend(anna, ben);
			await FriendshipService.addFriend(carla, anna);

			const annasFriends = (await FriendshipService.getFriendList(anna)).map((f) => f.nickname).sort();
			expect(annasFriends).toEqual(['ben', 'carla']);
			expect((await FriendshipService.getFriendList(ben)).map((f) => f.nickname)).toEqual(['anna']);
		});

		it('entfernen klappt von beiden Seiten und trifft nur diese Freundschaft', async () => {
			await FriendshipService.addFriend(anna, ben);
			await FriendshipService.addFriend(anna, carla);
			await FriendshipService.removeFriend(ben, anna);

			expect(await FriendshipService.areFriends(anna, ben)).toBe(false);
			expect(await FriendshipService.areFriends(anna, carla)).toBe(true);
		});
	});
});
