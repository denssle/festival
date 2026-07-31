import { beforeAll, describe, expect, it } from 'vitest';
import { ModelStatic, Model } from 'sequelize';
import { startDB } from '$lib/db/db';
import { sequelize } from '$lib/db/sequelize';
import { User } from '$lib/db/model/user';
import { GuestInformation } from '$lib/db/model/guestInformation';
import { GroupMember } from '$lib/db/model/groupMember';
import { Friendship } from '$lib/db/model/friendship';
import { FriendRequest } from '$lib/db/model/friendRequest';

/** Von showIndex() gelieferte Index-Beschreibung (dialektübergreifende Teilmenge). */
interface IndexDescription {
	unique: boolean;
	fields: { attribute: string }[];
}

/**
 * Verifiziert die Unique-Indizes gegen eine FRISCHE DB (In-Memory-SQLite via sync()).
 *
 * Hintergrund (Review 2026-07-31): Ein früheres Audit hatte Unique-Indizes „gegen die
 * echte DB" verifiziert – die enthielt sie aber nur als Altlast der alter:true-Ära,
 * in den Modell-Definitionen fehlten sie. Dieser Test prüft die Quelle (den Code):
 * Was sync() aus den Modellen erzeugt, MUSS die fachlichen Eindeutigkeiten erzwingen.
 */
describe('Unique-Indizes aus den Modell-Definitionen', () => {
	beforeAll(async () => {
		await startDB();
	});

	async function uniqueIndexFieldSets(model: ModelStatic<Model>): Promise<string[][]> {
		const table = model.getTableName();
		const indexes = (await sequelize.getQueryInterface().showIndex(table)) as IndexDescription[];
		return indexes.filter((index) => index.unique).map((index) => index.fields.map((field) => field.attribute));
	}

	it('users: nickname ist unique', async () => {
		expect(await uniqueIndexFieldSets(User)).toContainEqual(['nickname']);
	});

	it('guestInformations: (FestivalEventId, UserId) ist unique', async () => {
		expect(await uniqueIndexFieldSets(GuestInformation)).toContainEqual(['FestivalEventId', 'UserId']);
	});

	it('groupMembers: (GroupId, UserId) ist unique', async () => {
		expect(await uniqueIndexFieldSets(GroupMember)).toContainEqual(['GroupId', 'UserId']);
	});

	it('friendships: (friend1Id, friend2Id) ist unique', async () => {
		expect(await uniqueIndexFieldSets(Friendship)).toContainEqual(['friend1Id', 'friend2Id']);
	});

	it('friendRequests: (senderId, receiverId) ist unique', async () => {
		expect(await uniqueIndexFieldSets(FriendRequest)).toContainEqual(['senderId', 'receiverId']);
	});
});
