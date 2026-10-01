import { describe, expect, it } from 'vitest';
import { fallbackKeyForStatus, messageFromErrorBody } from './request.logic';

describe('messageFromErrorBody', () => {
	it('liest die Meldung aus { message }', () => {
		expect(messageFromErrorBody({ message: 'Zu lang.' })).toBe('Zu lang.');
	});

	it('ignoriert leere, fehlende und falsch getypte Meldungen', () => {
		expect(messageFromErrorBody({ message: '  ' })).toBeNull();
		expect(messageFromErrorBody({ message: 42 })).toBeNull();
		expect(messageFromErrorBody({ success: false })).toBeNull();
		expect(messageFromErrorBody('Unauthorized')).toBeNull();
		expect(messageFromErrorBody(null)).toBeNull();
	});
});

describe('fallbackKeyForStatus', () => {
	it('kennt die häufigen Status', () => {
		expect(fallbackKeyForStatus(401)).toBe('error.notAuthenticated');
		expect(fallbackKeyForStatus(403)).toBe('error.forbidden');
		expect(fallbackKeyForStatus(404)).toBe('error.notFound');
		expect(fallbackKeyForStatus(413)).toBe('error.tooLarge');
		expect(fallbackKeyForStatus(429)).toBe('error.tooManyRequests');
	});

	it('trennt Server- von sonstigen Fehlern', () => {
		expect(fallbackKeyForStatus(502)).toBe('error.internal');
		expect(fallbackKeyForStatus(422)).toBe('error.unknown');
	});
});
