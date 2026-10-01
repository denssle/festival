import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { Group } from '$lib/db/model/group';
import { GroupMember } from '$lib/db/model/groupMember';
import { createUser, resetDatabase } from '$lib/db/test-fixtures';
import { GroupService } from '$lib/services/group.service';

/** Gruppen: Nur der Besitzer ändert und löscht, er kann nicht austreten, Mitglieder schon. */
describe('GroupService', () => {
	let owner: string;
	let member: string;
	let groupId: string;

	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		await resetDatabase();
		owner = await createUser('besitzer');
		member = await createUser('mitglied');
		groupId = await GroupService.createGroup(owner, 'Wandergruppe', 'Sonntags');
	});

	it('der Ersteller ist Besitzer und zugleich Mitglied', async () => {
		expect((await Group.findByPk(groupId))?.dataValues.ownerId).toBe(owner);
		expect((await GroupService.getGroupsByUserId(owner)).map((g) => g.id)).toEqual([groupId]);
	});

	describe('beitreten', () => {
		it('macht zum Mitglied', async () => {
			expect(await GroupService.joinGroup(member, groupId)).toBe('Success');
			expect((await GroupService.getGroupsByUserId(member)).map((g) => g.name)).toEqual(['Wandergruppe']);
		});

		it('meldet einen zweiten Beitritt statt doppelt einzutragen', async () => {
			await GroupService.joinGroup(member, groupId);
			expect(await GroupService.joinGroup(member, groupId)).toBe('Already in Group');
			expect(await GroupMember.count({ where: { GroupId: groupId } })).toBe(2);
		});

		it('meldet eine nicht vorhandene Gruppe als fehlende Daten', async () => {
			expect(await GroupService.joinGroup(member, crypto.randomUUID())).toBe('Data Missing');
		});
	});

	describe('austreten', () => {
		it('ein Mitglied kann austreten', async () => {
			await GroupService.joinGroup(member, groupId);
			expect(await GroupService.leaveGroup(member, groupId)).toBe('Success');
			expect(await GroupService.getGroupsByUserId(member)).toEqual([]);
		});

		it('der Besitzer kann nicht austreten, nur löschen', async () => {
			expect(await GroupService.leaveGroup(owner, groupId)).toBe('Not authorized');
			expect(await GroupMember.count({ where: { GroupId: groupId, UserId: owner } })).toBe(1);
		});

		it('wer nicht Mitglied ist, kann nicht austreten', async () => {
			expect(await GroupService.leaveGroup(member, groupId)).toBe('Failure');
		});

		it('meldet eine nicht vorhandene Gruppe', async () => {
			expect(await GroupService.leaveGroup(member, crypto.randomUUID())).toBe('Data Missing');
		});
	});

	describe('ändern und löschen', () => {
		it('nur der Besitzer darf ändern', async () => {
			await GroupService.joinGroup(member, groupId);
			expect(await GroupService.updateGroup(member, groupId, 'Gekapert', '')).toBe('Not authorized');
			expect(await GroupService.updateGroup(owner, groupId, 'Bergsteiger', 'Samstags')).toBe('Success');
			expect((await Group.findByPk(groupId))?.dataValues.name).toBe('Bergsteiger');
		});

		it('nur der Besitzer darf löschen, die Mitgliedschaften gehen mit', async () => {
			await GroupService.joinGroup(member, groupId);
			expect(await GroupService.deleteGroup(member, groupId)).toBe('Not authorized');
			expect(await GroupService.deleteGroup(owner, groupId)).toBe('Success');
			expect(await GroupMember.count()).toBe(0);
		});

		it('meldet nicht vorhandene Gruppen', async () => {
			expect(await GroupService.updateGroup(owner, crypto.randomUUID(), 'x', '')).toBe('Data Missing');
			expect(await GroupService.deleteGroup(owner, crypto.randomUUID())).toBe('Data Missing');
		});
	});

	describe('suchen', () => {
		it('findet über Name und Beschreibung', async () => {
			await GroupService.createGroup(owner, 'Kochclub', 'Wandern und Essen');
			const names = (await GroupService.searchGroups('wander')).map((g) => g.name).sort();
			expect(names).toEqual(['Kochclub', 'Wandergruppe']);
		});

		it('LIKE-Platzhalter in der Eingabe finden nicht einfach alles', async () => {
			// In MariaDB maskiert der Backslash die Platzhalter. SQLite kennt ohne ESCAPE-Klausel
			// kein Maskierzeichen und sucht dann nach einem echten Backslash – auch dort findet
			// '%' also nicht alles. Ob „50%“ die Gruppe „50% Rabatt“ findet, lässt sich nur auf
			// MariaDB prüfen.
			expect(await GroupService.searchGroups('%')).toEqual([]);
			expect(await GroupService.searchGroups('_')).toEqual([]);
		});
	});
});
