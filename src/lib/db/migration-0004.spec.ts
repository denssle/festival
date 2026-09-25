import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { QueryTypes, Sequelize, UniqueConstraintError } from 'sequelize';
import { createMigrator } from '$lib/db/migrations';
import { up as migration0004Up } from '$lib/db/migrations/0004-teilnahme-antwort-dreiwertig';

/**
 * Datenübernahme von Migration 0004: `guestInformations.coming` (BOOLEAN) wird zu
 * `answer` ('yes' | 'maybe' | 'no'). Der Drift-Test prüft nur das Schema einer leeren DB.
 */
describe('Migration 0004: dreiwertige Teilnahme-Antwort', () => {
	let db: Sequelize;
	const now = new Date().toISOString();
	const owner = crypto.randomUUID();
	const festival = crypto.randomUUID();
	const guests = { yes: crypto.randomUUID(), no: crypto.randomUUID(), unset: crypto.randomUUID() };

	async function answers(): Promise<Record<string, string>> {
		const rows = await db.query<{ UserId: string; answer: string }>('SELECT UserId, answer FROM guestInformations', {
			type: QueryTypes.SELECT
		});
		return Object.fromEntries(rows.map((row) => [row.UserId, row.answer]));
	}

	beforeAll(async () => {
		db = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
		const migrator = createMigrator(db);
		await migrator.up({ to: '0003-kommentarziele-als-fremdschluessel' });

		const qi = db.getQueryInterface();
		const user = (id: string) => ({ id, password: 'hash', nickname: id, createdAt: now, updatedAt: now });
		await qi.bulkInsert('users', [user(owner), user(guests.yes), user(guests.no), user(guests.unset)]);
		await qi.bulkInsert('festivalEvents', [{ id: festival, name: 'F', UserId: owner, createdAt: now, updatedAt: now }]);
		const info = (UserId: string, coming: boolean | null) => ({
			id: crypto.randomUUID(),
			UserId,
			FestivalEventId: festival,
			coming,
			numberOfOtherGuests: 0,
			createdAt: now,
			updatedAt: now
		});
		await qi.bulkInsert('guestInformations', [
			info(guests.yes, true),
			info(guests.no, false),
			info(guests.unset, null)
		]);

		await migrator.up({ to: '0004-teilnahme-antwort-dreiwertig' });
	});

	afterAll(async () => {
		await db.close();
	});

	// NULL galt im Code schon immer als „nicht dabei“ (Filter auf !coming).
	it('übernimmt true als yes und alles andere als no', async () => {
		expect(await answers()).toEqual({ [guests.yes]: 'yes', [guests.no]: 'no', [guests.unset]: 'no' });
	});

	it('entfernt die alte Spalte coming', async () => {
		expect(Object.keys(await db.getQueryInterface().describeTable('guestInformations'))).not.toContain('coming');
	});

	it('übersteht einen zweiten Lauf', async () => {
		await migration0004Up(db.getQueryInterface());
		expect(Object.keys(await answers())).toHaveLength(3);
	});

	// Der eigentliche Grund für ALTER TABLE statt Sequelizes removeColumn: Unter SQLite
	// baute removeColumn die Tabelle neu und verlöre den zusammengesetzten Unique-Index.
	it('lässt den Unique-Index (FestivalEventId, UserId) stehen', async () => {
		await expect(
			db.getQueryInterface().bulkInsert('guestInformations', [
				{
					id: crypto.randomUUID(),
					UserId: guests.yes,
					FestivalEventId: festival,
					answer: 'maybe',
					numberOfOtherGuests: 0,
					createdAt: now,
					updatedAt: now
				}
			])
		).rejects.toThrow(UniqueConstraintError);
	});

	it('lässt sich zurückrollen (down), maybe wird dabei zu false', async () => {
		await db.query('UPDATE guestInformations SET answer = ? WHERE UserId = ?', {
			replacements: ['maybe', guests.no]
		});
		await createMigrator(db).down({ to: '0004-teilnahme-antwort-dreiwertig' });

		const rows = await db.query<{ UserId: string; coming: number }>('SELECT UserId, coming FROM guestInformations', {
			type: QueryTypes.SELECT
		});
		expect(Object.fromEntries(rows.map((row) => [row.UserId, row.coming]))).toEqual({
			[guests.yes]: 1,
			[guests.no]: 0,
			[guests.unset]: 0
		});
	});
});
