import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { QueryTypes, Sequelize } from 'sequelize';
import { createMigrator } from '$lib/db/migrations';
import { down as migration0005Down, up as migration0005Up } from '$lib/db/migrations/0005-mail-bestaetigung-und-tokens';

/**
 * Migration 0005 auf einer befüllten DB: Bestandsnutzer bleiben unbestätigt, die
 * Token-Tabelle hängt per Kaskade am Nutzer, und die Migration verträgt einen zweiten Lauf.
 */
describe('Migration 0005: Mailbestätigung und Mail-Tokens', () => {
	let db: Sequelize;
	const now = new Date().toISOString();
	const userId = crypto.randomUUID();

	async function count(sql: string): Promise<number> {
		const [row] = await db.query<{ n: number }>(sql, { type: QueryTypes.SELECT });
		return Number(row.n);
	}

	beforeAll(async () => {
		db = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
		await db.query('PRAGMA foreign_keys = ON');
		await createMigrator(db).up({ to: '0004-teilnahme-antwort-dreiwertig' });
		await db
			.getQueryInterface()
			.bulkInsert('users', [
				{ id: userId, password: 'hash', nickname: 'alt', email: 'alt@example.com', createdAt: now, updatedAt: now }
			]);
		await createMigrator(db).up();
	});

	afterAll(async () => {
		await db.close();
	});

	it('lässt Bestandsadressen unbestätigt', async () => {
		expect(await count('SELECT COUNT(*) AS n FROM users WHERE emailVerifiedAt IS NULL')).toBe(1);
	});

	it('verträgt einen zweiten Lauf', async () => {
		await expect(migration0005Up(db.getQueryInterface())).resolves.toBeUndefined();
	});

	it('räumt Tokens mit dem Nutzer ab', async () => {
		await db.getQueryInterface().bulkInsert('mailTokens', [
			{
				id: crypto.randomUUID(),
				UserId: userId,
				purpose: 'resetPassword',
				tokenHash: 'hash-1',
				expiresAt: now,
				createdAt: now,
				updatedAt: now
			}
		]);
		await db.query('DELETE FROM users WHERE id = ?', { replacements: [userId] });
		expect(await count('SELECT COUNT(*) AS n FROM mailTokens')).toBe(0);
	});

	it('nimmt mit down() Tabelle und Spalte wieder weg', async () => {
		await migration0005Down(db.getQueryInterface());
		const tables = (await db.getQueryInterface().showAllTables()) as unknown[];
		expect(tables).not.toContain('mailTokens');
		expect('emailVerifiedAt' in (await db.getQueryInterface().describeTable('users'))).toBe(false);
	});
});
