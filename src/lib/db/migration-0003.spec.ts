import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { QueryTypes, Sequelize } from 'sequelize';
import { createMigrator } from '$lib/db/migrations';

/**
 * Datenübernahme von Migration 0003: Aus der polymorphen Spalte `writtenTo` wird je nach
 * Ziel `FestivalEventId` oder `ProfileUserId`. Der Drift-Test (migrations.spec.ts) prüft
 * nur das Schema auf einer leeren DB – hier läuft die Migration über echte Altdaten.
 */
describe('Migration 0003: Kommentarziele als Fremdschlüssel', () => {
	let db: Sequelize;
	const now = new Date().toISOString();
	const ids = {
		owner: crypto.randomUUID(),
		guest: crypto.randomUUID(),
		festival: crypto.randomUUID(),
		festivalComment: crypto.randomUUID(),
		profileComment: crypto.randomUUID(),
		orphanComment: crypto.randomUUID()
	};

	interface CommentRow {
		id: string;
		FestivalEventId: string | null;
		ProfileUserId: string | null;
		comment: string;
	}

	async function comments(): Promise<CommentRow[]> {
		return db.query<CommentRow>('SELECT id, FestivalEventId, ProfileUserId, comment FROM comments ORDER BY comment', {
			type: QueryTypes.SELECT
		});
	}

	beforeAll(async () => {
		db = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
		const migrator = createMigrator(db);
		await migrator.up({ to: '0002-freitext-als-text' });

		const qi = db.getQueryInterface();
		await qi.bulkInsert('users', [
			{ id: ids.owner, password: 'hash', nickname: 'owner', createdAt: now, updatedAt: now },
			{ id: ids.guest, password: 'hash', nickname: 'guest', createdAt: now, updatedAt: now }
		]);
		await qi.bulkInsert('festivalEvents', [
			{ id: ids.festival, name: 'Festival', UserId: ids.owner, createdAt: now, updatedAt: now }
		]);
		await qi.bulkInsert('comments', [
			// Altformat: writtenTo zeigt mal auf ein Festival, mal auf ein Profil, mal ins Leere.
			{
				id: ids.festivalComment,
				writtenBy: ids.guest,
				writtenTo: ids.festival,
				comment: 'a-festival',
				createdAt: now,
				updatedAt: now
			},
			{
				id: ids.profileComment,
				writtenBy: ids.guest,
				writtenTo: ids.owner,
				comment: 'b-profil',
				createdAt: now,
				updatedAt: now
			},
			{
				id: ids.orphanComment,
				writtenBy: ids.guest,
				writtenTo: crypto.randomUUID(),
				comment: 'c-waise',
				createdAt: now,
				updatedAt: now
			}
		]);

		await migrator.up({ to: '0003-kommentarziele-als-fremdschluessel' });
	});

	afterAll(async () => {
		await db.close();
	});

	it('ordnet jedes Ziel der richtigen Spalte zu und verwirft Waisen', async () => {
		expect(await comments()).toEqual([
			{ id: ids.festivalComment, FestivalEventId: ids.festival, ProfileUserId: null, comment: 'a-festival' },
			{ id: ids.profileComment, FestivalEventId: null, ProfileUserId: ids.owner, comment: 'b-profil' }
		]);
	});

	it('räumt Kommentare jetzt per Kaskade mit dem Ziel ab', async () => {
		// Nutzer löschen: Profil-Kommentar direkt, Festival-Kommentar über das Festival.
		await db.query('DELETE FROM users WHERE id = ?', { replacements: [ids.owner] });
		expect(await comments()).toEqual([]);
	});

	it('lässt sich zurückrollen (down)', async () => {
		const qi = db.getQueryInterface();
		await qi.bulkInsert('users', [
			{ id: ids.owner, password: 'hash', nickname: 'owner', createdAt: now, updatedAt: now }
		]);
		await qi.bulkInsert('comments', [
			{
				id: ids.profileComment,
				writtenBy: ids.guest,
				ProfileUserId: ids.owner,
				comment: 'b-profil',
				createdAt: now,
				updatedAt: now
			}
		]);

		await createMigrator(db).down({ to: '0003-kommentarziele-als-fremdschluessel' });

		const rows = await db.query<{ id: string; writtenTo: string }>('SELECT id, writtenTo FROM comments', {
			type: QueryTypes.SELECT
		});
		expect(rows).toEqual([{ id: ids.profileComment, writtenTo: ids.owner }]);
	});
});
