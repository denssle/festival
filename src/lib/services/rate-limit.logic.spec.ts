import { describe, it, expect } from 'vitest';
import { LoginRateLimiter, loginRateLimitKey } from './rate-limit.logic';

describe('LoginRateLimiter', () => {
	const windowMs = 15 * 60 * 1000;
	const maxAttempts = 5;
	const t0 = 1_000_000;
	const makeLimiter = (options = {}) => new LoginRateLimiter({ maxAttempts, windowMs, ...options });

	it('sollte ohne Fehlversuche nicht sperren', () => {
		expect(makeLimiter().isBlocked('key', t0)).toBe(false);
	});

	it('sollte unterhalb der Grenze nicht sperren', () => {
		const limiter = makeLimiter();
		for (let i = 0; i < maxAttempts - 1; i++) {
			limiter.recordFailure('key', t0 + i);
		}
		expect(limiter.isBlocked('key', t0 + maxAttempts)).toBe(false);
	});

	it('sollte ab Erreichen der Grenze sperren', () => {
		const limiter = makeLimiter();
		for (let i = 0; i < maxAttempts; i++) {
			limiter.recordFailure('key', t0 + i);
		}
		expect(limiter.isBlocked('key', t0 + maxAttempts)).toBe(true);
	});

	it('sollte Schlüssel unabhängig voneinander behandeln', () => {
		const limiter = makeLimiter();
		for (let i = 0; i < maxAttempts; i++) {
			limiter.recordFailure('key-a', t0 + i);
		}
		expect(limiter.isBlocked('key-a', t0 + maxAttempts)).toBe(true);
		expect(limiter.isBlocked('key-b', t0 + maxAttempts)).toBe(false);
	});

	it('sollte nach Ablauf des Fensters wieder freigeben', () => {
		const limiter = makeLimiter();
		for (let i = 0; i < maxAttempts; i++) {
			limiter.recordFailure('key', t0 + i);
		}
		expect(limiter.isBlocked('key', t0 + windowMs - 1)).toBe(true); // alle 5 noch im Fenster
		expect(limiter.isBlocked('key', t0 + windowMs)).toBe(false); // ältester Versuch herausgerutscht → nur noch 4
		expect(limiter.isBlocked('key', t0 + maxAttempts - 1 + windowMs)).toBe(false); // alle abgelaufen
	});

	it('sollte nach reset (erfolgreicher Login) wieder freigeben', () => {
		const limiter = makeLimiter();
		for (let i = 0; i < maxAttempts; i++) {
			limiter.recordFailure('key', t0 + i);
		}
		expect(limiter.isBlocked('key', t0 + maxAttempts)).toBe(true);
		limiter.reset('key');
		expect(limiter.isBlocked('key', t0 + maxAttempts)).toBe(false);
	});

	it('sollte abgelaufene Schlüssel verwerfen, wenn maxTrackedKeys überschritten wird', () => {
		const limiter = makeLimiter({ maxTrackedKeys: 2 });
		limiter.recordFailure('old-1', t0);
		limiter.recordFailure('old-2', t0);
		// Beide alten Einträge liegen außerhalb des Fensters → werden beim Prune entfernt
		limiter.recordFailure('new', t0 + windowMs + 1);
		expect(limiter.isBlocked('old-1', t0 + windowMs + 1)).toBe(false);
		expect(limiter.isBlocked('new', t0 + windowMs + 1)).toBe(false);
	});
});

describe('loginRateLimitKey', () => {
	it('sollte IP und normalisierten Nickname kombinieren', () => {
		expect(loginRateLimitKey('1.2.3.4', '  Alice ')).toBe('1.2.3.4:alice');
	});

	it('sollte unterschiedliche IPs unterscheiden', () => {
		expect(loginRateLimitKey('1.2.3.4', 'alice')).not.toBe(loginRateLimitKey('5.6.7.8', 'alice'));
	});
});
