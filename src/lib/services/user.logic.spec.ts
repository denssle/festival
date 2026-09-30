import { describe, it, expect } from 'vitest';
import {
	isSessionTokenExpired,
	MAX_PASSWORD_BYTES,
	readTextField,
	validateNewPassword,
	validatePasswordChange
} from './user.logic';

describe('readTextField', () => {
	it('sollte den Wert eines vorhandenen Feldes liefern', () => {
		const values = new FormData();
		values.set('email', 'test@example.com');
		expect(readTextField(values, 'email')).toBe('test@example.com');
	});

	// Der eigentliche Fehler: String(null) ergab den Text "null", der so in der DB landete.
	it('sollte einen leeren String liefern, wenn das Feld gar nicht gesendet wurde', () => {
		expect(readTextField(new FormData(), 'email')).toBe('');
	});

	it('sollte einen leeren String liefern, wenn das Feld leer gesendet wurde', () => {
		const values = new FormData();
		values.set('lastname', '');
		expect(readTextField(values, 'lastname')).toBe('');
	});

	// Sonst stünde "[object File]" im Namensfeld.
	it('sollte einen leeren String liefern, wenn das Feld eine Datei ist', () => {
		const values = new FormData();
		values.set('forename', new File(['inhalt'], 'bild.png', { type: 'image/png' }));
		expect(readTextField(values, 'forename')).toBe('');
	});

	it('sollte Leerzeichen im Wert unangetastet lassen', () => {
		const values = new FormData();
		values.set('forename', '  Anna  ');
		expect(readTextField(values, 'forename')).toBe('  Anna  ');
	});
});

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
	const nickname = 'Partylöwe';

	it('sollte null liefern bei gültigen Eingaben', () => {
		expect(validatePasswordChange('oldPass123', 'newPass456', 'newPass456', nickname, minLength)).toBeNull();
	});

	it('sollte das aktuelle Passwort verlangen', () => {
		expect(validatePasswordChange(undefined, 'newPass456', 'newPass456', nickname, minLength)).toBe(
			'auth.error.currentPasswordRequired'
		);
		expect(validatePasswordChange('', 'newPass456', 'newPass456', nickname, minLength)).toBe(
			'auth.error.currentPasswordRequired'
		);
	});

	it('sollte neues Passwort und Wiederholung verlangen', () => {
		expect(validatePasswordChange('oldPass123', undefined, 'newPass456', nickname, minLength)).toBe(
			'auth.error.newPasswordRequired'
		);
		expect(validatePasswordChange('oldPass123', 'newPass456', undefined, nickname, minLength)).toBe(
			'auth.error.newPasswordRequired'
		);
		expect(validatePasswordChange('oldPass123', '', '', nickname, minLength)).toBe('auth.error.newPasswordRequired');
	});

	it('sollte die Mindestlänge des neuen Passworts prüfen', () => {
		expect(validatePasswordChange('oldPass123', 'short', 'short', nickname, minLength)).toBe(
			'auth.error.passwordTooShort'
		);
	});

	it('sollte die Passwortregeln auch bei der Änderung anwenden', () => {
		expect(validatePasswordChange('oldPass123', 'password123', 'password123', nickname, minLength)).toBe(
			'auth.error.passwordTooCommon'
		);
	});

	it('sollte nicht übereinstimmende Passwörter ablehnen', () => {
		expect(validatePasswordChange('oldPass123', 'newPass456', 'newPass457', nickname, minLength)).toBe(
			'auth.error.passwordsDoNotMatch'
		);
	});
});

describe('validateNewPassword', () => {
	const minLength = 8;
	const nickname = 'Partylöwe';

	it('lässt ein langes, unauffälliges Passwort ohne Sonderzeichen durch', () => {
		expect(validateNewPassword('grüne gurken im mondschein', nickname, minLength)).toBeNull();
	});

	it('lehnt zu kurze Passwörter ab', () => {
		expect(validateNewPassword('kurz12', nickname, minLength)).toBe('auth.error.passwordTooShort');
	});

	it('lässt genau 72 Bytes durch und lehnt das 73. ab', () => {
		expect(validateNewPassword('a'.repeat(MAX_PASSWORD_BYTES), nickname, minLength)).toBeNull();
		expect(validateNewPassword('a'.repeat(MAX_PASSWORD_BYTES + 1), nickname, minLength)).toBe(
			'auth.error.passwordTooLong'
		);
	});

	it('zählt Bytes statt Zeichen – Umlaute belegen zwei', () => {
		// 37 × „ä“ = 37 Zeichen, aber 74 Bytes in UTF-8
		expect(validateNewPassword('ä'.repeat(37), nickname, minLength)).toBe('auth.error.passwordTooLong');
	});

	it('lehnt den eigenen Nickname ab, unabhängig von Groß-/Kleinschreibung', () => {
		expect(validateNewPassword('partylöwe', nickname, minLength)).toBe('auth.error.passwordEqualsNickname');
		expect(validateNewPassword(' PARTYLÖWE ', nickname, minLength)).toBe('auth.error.passwordEqualsNickname');
	});

	it('lehnt verbreitete Passwörter ab, unabhängig von Groß-/Kleinschreibung', () => {
		expect(validateNewPassword('12345678', nickname, minLength)).toBe('auth.error.passwordTooCommon');
		expect(validateNewPassword('Passwort123', nickname, minLength)).toBe('auth.error.passwordTooCommon');
	});
});
