import { describe, it, expect, vi } from 'vitest';
import { resolveSessionToken } from './user.logic';
import type { BackendUser } from '$lib/models/user/BackendUser';
import type { SessionTokenUser } from '$lib/models/user/SessionTokenUser';

const mockBackendUser: BackendUser = {
	id: 'user-1',
	nickname: 'testuser',
	password: 'hashed',
	email: 'test@example.com',
	forename: '',
	lastname: '',
	createdAt: new Date(),
	updatedAt: new Date()
};

const mockSessionTokenUser: SessionTokenUser = {
	id: 'user-1',
	nickname: 'testuser',
	token: 'existing-token-abc',
	email: 'test@example.com'
};

describe('resolveSessionToken', () => {
	describe('BackendUser (kein Token vorhanden)', () => {
		it('sollte einen neuen Token generieren und DB-Upsert anfordern', () => {
			const generate = vi.fn().mockReturnValue('new-token-123');
			const [token, needsDbUpsert] = resolveSessionToken(mockBackendUser, false, generate);

			expect(token).toBe('new-token-123');
			expect(needsDbUpsert).toBe(true);
			expect(generate).toHaveBeenCalledOnce();
		});

		it('sollte auch bei forceNewToken=true einen neuen Token generieren', () => {
			const generate = vi.fn().mockReturnValue('new-token-456');
			const [token, needsDbUpsert] = resolveSessionToken(mockBackendUser, true, generate);

			expect(token).toBe('new-token-456');
			expect(needsDbUpsert).toBe(true);
			expect(generate).toHaveBeenCalledOnce();
		});
	});

	describe('SessionTokenUser (bestehender Token im Cookie)', () => {
		it('sollte den bestehenden Token wiederverwenden und KEINEN DB-Upsert anfordern (forceNewToken=false)', () => {
			const generate = vi.fn().mockReturnValue('should-not-be-used');
			const [token, needsDbUpsert] = resolveSessionToken(mockSessionTokenUser, false, generate);

			expect(token).toBe('existing-token-abc');
			expect(needsDbUpsert).toBe(false);
			expect(generate).not.toHaveBeenCalled();
		});

		it('sollte einen neuen Token generieren und DB-Upsert anfordern bei forceNewToken=true (Login)', () => {
			const generate = vi.fn().mockReturnValue('fresh-login-token');
			const [token, needsDbUpsert] = resolveSessionToken(mockSessionTokenUser, true, generate);

			expect(token).toBe('fresh-login-token');
			expect(needsDbUpsert).toBe(true);
			expect(generate).toHaveBeenCalledOnce();
		});
	});
});
