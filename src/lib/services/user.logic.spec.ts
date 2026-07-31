import { describe, it, expect } from 'vitest';
import { isSessionTokenExpired, validatePasswordChange } from './user.logic';

describe('isSessionTokenExpired', () => {
	const maxAgeMs = 1000 * 60 * 60 * 24 * 30; // 30 Tage
	const now = new Date('2026-07-09T12:00:00Z');

	it('sollte false liefern für einen frisch ausgestellten Token', () => {
		const issuedAt = new Date('2026-07-09T11:59:00Z'); // vor 1 Minute
		expect(isSessionTokenExpired(issuedAt, maxAgeMs, now)).toBe(false);
	});

	it('sollte false liefern kurz vor Ablauf der Lebensdauer', () => {
		const issuedAt = new Date(now.getTime() - maxAgeMs + 1000); // 1 Sekunde übrig
		expect(isSessionTokenExpired(issuedAt, maxAgeMs, now)).toBe(false);
	});

	it('sollte true liefern für einen abgelaufenen Token', () => {
		const issuedAt = new Date(now.getTime() - maxAgeMs - 1000); // 1 Sekunde zu alt
		expect(isSessionTokenExpired(issuedAt, maxAgeMs, now)).toBe(true);
	});

	it('sollte true liefern, wenn kein Ausstellungszeitpunkt vorhanden ist', () => {
		expect(isSessionTokenExpired(undefined, maxAgeMs, now)).toBe(true);
	});

	it('sollte true liefern bei ungültigem Datum', () => {
		expect(isSessionTokenExpired(new Date('invalid'), maxAgeMs, now)).toBe(true);
	});

	it('sollte den aktuellen Zeitpunkt verwenden, wenn now nicht übergeben wird', () => {
		const issuedAt = new Date(Date.now() - maxAgeMs - 10000);
		expect(isSessionTokenExpired(issuedAt, maxAgeMs)).toBe(true);
	});
});

describe('validatePasswordChange', () => {
	const minLength = 8;

	it('sollte null liefern bei gültigen Eingaben', () => {
		expect(validatePasswordChange('oldPass123', 'newPass456', 'newPass456', minLength)).toBeNull();
	});

	it('sollte das aktuelle Passwort verlangen', () => {
		expect(validatePasswordChange(undefined, 'newPass456', 'newPass456', minLength)).toBe(
			'Current password is required'
		);
		expect(validatePasswordChange('', 'newPass456', 'newPass456', minLength)).toBe('Current password is required');
	});

	it('sollte neues Passwort und Wiederholung verlangen', () => {
		expect(validatePasswordChange('oldPass123', undefined, 'newPass456', minLength)).toBe(
			'New password and repetition are required'
		);
		expect(validatePasswordChange('oldPass123', 'newPass456', undefined, minLength)).toBe(
			'New password and repetition are required'
		);
		expect(validatePasswordChange('oldPass123', '', '', minLength)).toBe('New password and repetition are required');
	});

	it('sollte die Mindestlänge des neuen Passworts prüfen', () => {
		expect(validatePasswordChange('oldPass123', 'short', 'short', minLength)).toBe(
			`Password must be at least ${minLength} characters long`
		);
	});

	it('sollte nicht übereinstimmende Passwörter ablehnen', () => {
		expect(validatePasswordChange('oldPass123', 'newPass456', 'newPass457', minLength)).toBe('Passwords do not match');
	});
});
