import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { FestivalEvent } from '$lib/db/model/festivalEvent';
import { createFestival, createUser, resetDatabase } from '$lib/db/test-fixtures';
import { FestivalEventService } from '$lib/services/festival-event.service';
import type { CurrentUser } from '$lib/models/user/CurrentUser';

/** Festivals bearbeiten und löschen darf nur, wer sie angelegt hat. Sichtbarkeit: festival-visibility.spec.ts. */
describe('FestivalEventService', () => {
	let owner: CurrentUser;
	let stranger: CurrentUser;
	let festivalId: string;

	const asUser = (id: string, nickname: string): CurrentUser => ({ isAuthenticated: true, id, nickname, email: '' });
	const update = (user: CurrentUser | null, name: string) =>
		FestivalEventService.updateFestival(user, festivalId, name, 'Beschreibung', null, true, false, 'Garten');

	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		await resetDatabase();
		owner = asUser(await createUser('gastgeber'), 'gastgeber');
		stranger = asUser(await createUser('fremd'), 'fremd');
		festivalId = await createFestival(owner.id, 'Sommerfest');
	});

	it('nur der Besitzer darf bearbeiten', async () => {
		expect(await update(stranger, 'Gekapert')).toBe('Not authorized');
		expect(await update(owner, 'Herbstfest')).toBe('Success');

		const saved = (await FestivalEvent.findByPk(festivalId))?.dataValues;
		expect(saved).toMatchObject({ name: 'Herbstfest', location: 'Garten', bringYourOwnBottle: true });
	});

	it('ohne Nutzer oder bei unbekanntem Festival meldet es fehlende Daten', async () => {
		expect(await update(null, 'x')).toBe('Data Missing');
		expect(await FestivalEventService.updateFestival(owner, crypto.randomUUID(), 'x', '', null, false, false, '')).toBe(
			'Data Missing'
		);
	});

	it('nur der Besitzer darf löschen', async () => {
		expect(await FestivalEventService.deleteFestival(stranger, festivalId)).toBe('Not authorized');
		expect(await FestivalEventService.deleteFestival(owner, festivalId)).toBe('Success');
		expect(await FestivalEvent.count()).toBe(0);
	});

	it('legt ein Festival mit dem Ersteller als Besitzer an', async () => {
		const created = await FestivalEventService.createFestival(owner, 'Neu', '', null, false, true, 'Park');
		expect(created?.createdBy?.id).toBe(owner.id);
		expect(await FestivalEventService.createFestival(null, 'Neu', '', null, false, true, 'Park')).toBeNull();
	});
});
