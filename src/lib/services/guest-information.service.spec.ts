import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { GuestInformation } from '$lib/db/model/guestInformation';
import { createFestival, createUser, resetDatabase } from '$lib/db/test-fixtures';
import { GuestInformationService } from '$lib/services/guest-information.service';
import type { CurrentUser } from '$lib/models/user/CurrentUser';
import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';

/** Zusage wie aus dem Dialog, mit leeren Standardwerten. */
function joining(fields: Partial<BaseGuestInformation> = {}): BaseGuestInformation {
	return { food: '', drink: '', numberOfOtherGuests: 0, answer: 'yes', comment: '', ...fields };
}

/** Zu- und Absagen: eine Zeile pro Gast und Festival, die Antwort wechselt darin. */
describe('GuestInformationService', () => {
	let guest: CurrentUser;
	let festivalId: string;

	async function row() {
		const rows = await GuestInformation.findAll({ where: { UserId: guest.id, FestivalEventId: festivalId } });
		expect(rows).toHaveLength(1);
		return rows[0].dataValues;
	}

	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		await resetDatabase();
		const owner = await createUser('gastgeber');
		const guestId = await createUser('gast');
		guest = { isAuthenticated: true, id: guestId, nickname: 'gast', email: '' };
		festivalId = await createFestival(owner);
	});

	it('eine zweite Zusage ändert die erste, statt eine weitere anzulegen', async () => {
		await GuestInformationService.joinFestival(guest, festivalId, joining({ food: 'Salat', numberOfOtherGuests: 1 }));
		await GuestInformationService.joinFestival(guest, festivalId, joining({ food: 'Kuchen', numberOfOtherGuests: 2 }));

		const info = await row();
		expect(info).toMatchObject({ answer: 'yes', food: 'Kuchen', numberOfOtherGuests: 2 });
	});

	it('„Vielleicht“ nach einer Zusage behält die Mitbring-Angaben', async () => {
		await GuestInformationService.joinFestival(guest, festivalId, joining({ food: 'Salat', drink: 'Saft' }));
		await GuestInformationService.answerWithComment(guest, festivalId, 'maybe', 'wenn der Zug fährt');

		expect(await row()).toMatchObject({ answer: 'maybe', comment: 'wenn der Zug fährt', food: 'Salat', drink: 'Saft' });
	});

	it('eine Absage ohne vorherige Zusage legt eine Zeile ohne Begleitung an', async () => {
		await GuestInformationService.answerWithComment(guest, festivalId, 'no', 'krank');
		expect(await row()).toMatchObject({ answer: 'no', comment: 'krank', numberOfOtherGuests: 0 });
	});

	it('„geht zu“ zählt nur Zusagen', async () => {
		const other = await createFestival(await createUser('andere'), 'Zweites');
		await GuestInformationService.joinFestival(guest, festivalId, joining());
		await GuestInformationService.answerWithComment(guest, other, 'maybe', '');

		const active = await GuestInformationService.getAllActiveGuestInformation(guest.id);
		expect(active.map((a) => a.FestivalEventId)).toEqual([festivalId]);
	});

	it('ohne Nutzer wird nichts gespeichert', async () => {
		await expect(GuestInformationService.joinFestival(null, festivalId, joining())).rejects.toThrow();
		await expect(GuestInformationService.answerWithComment(null, festivalId, 'no', '')).rejects.toThrow();
		expect(await GuestInformation.count()).toBe(0);
	});
});
