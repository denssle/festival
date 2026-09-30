import { describe, expect, it } from 'vitest';
import { generateMailToken, hashMailToken, isMailTokenExpired } from './mail-token.logic';

describe('mail-token.logic', () => {
	it('liefert zum Token genau den Hash, den hashMailToken berechnet', () => {
		const { token, tokenHash } = generateMailToken();
		expect(hashMailToken(token)).toBe(tokenHash);
		expect(tokenHash).not.toContain(token);
	});

	it('erzeugt URL-taugliche, nicht wiederholte Tokens', () => {
		const tokens = new Set(Array.from({ length: 50 }, () => generateMailToken().token));
		expect(tokens.size).toBe(50);
		for (const token of tokens) {
			expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
		}
	});

	it('gilt bis vor dem Ablaufzeitpunkt, ab dann nicht mehr', () => {
		const expiresAt = new Date('2026-09-30T12:00:00Z');
		expect(isMailTokenExpired(expiresAt, new Date('2026-09-30T11:59:59Z'))).toBe(false);
		expect(isMailTokenExpired(expiresAt, new Date('2026-09-30T12:00:00Z'))).toBe(true);
	});

	it('behandelt ein ungültiges Datum als abgelaufen', () => {
		expect(isMailTokenExpired(new Date('invalid'))).toBe(true);
	});
});
