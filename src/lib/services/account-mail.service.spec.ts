import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { sequelize } from '$lib/db/sequelize';
import { User } from '$lib/db/model/user';
import { MailToken } from '$lib/db/model/mailToken';
import { AccountMailService } from '$lib/services/account-mail.service';
import { MailService } from '$lib/services/mail.service';
import { UserService } from '$lib/services/user.service';
import { SessionToken } from '$lib/db/model/sessionToken';

function lastLink(to: string): string {
	const mail = MailService.outbox()
		.filter((m) => m.to === to)
		.at(-1);
	const match = mail?.text.match(/verify-email\?token=([A-Za-z0-9_-]+)/);
	if (!match) {
		throw new Error(`Kein Bestätigungslink an ${to} im Postausgang`);
	}
	return match[1];
}

describe('Adressbestätigung', () => {
	let userId: string;
	let email: string;

	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		for (const model of Object.values(sequelize.models)) {
			await model.destroy({ where: {}, truncate: true, cascade: true });
		}
		userId = crypto.randomUUID();
		email = `${userId}@example.com`;
		await User.create({ id: userId, nickname: userId, password: 'hash', email });
	});

	it('schickt einen Link, der die Adresse genau einmal bestätigt', async () => {
		expect(await AccountMailService.sendEmailVerification(userId, 'http://localhost:5173', 'de')).toBe('sent');
		const token = lastLink(email);

		expect(await AccountMailService.verifyEmail(token)).toBe(true);
		expect(await UserService.isEmailVerified(userId)).toBe(true);
		expect(await AccountMailService.verifyEmail(token)).toBe(false);
	});

	it('speichert nur den Hash des Tokens', async () => {
		await AccountMailService.sendEmailVerification(userId, 'http://localhost:5173', 'de');
		const token = lastLink(email);
		const stored = await MailToken.findAll();
		expect(stored).toHaveLength(1);
		expect(stored[0].dataValues.tokenHash).not.toBe(token);
	});

	it('bestätigt nichts, wenn die Adresse inzwischen geändert wurde', async () => {
		await AccountMailService.sendEmailVerification(userId, 'http://localhost:5173', 'de');
		const token = lastLink(email);
		await UserService.updateUser(userId, { nickname: userId, email: 'andere@example.com', forename: '', lastname: '' });

		expect(await AccountMailService.verifyEmail(token)).toBe(false);
		expect(await UserService.isEmailVerified(userId)).toBe(false);
	});

	it('entwertet ältere Links, sobald ein neuer ausgegeben wird', async () => {
		await AccountMailService.sendEmailVerification(userId, 'http://localhost:5173', 'de');
		const first = lastLink(email);
		await AccountMailService.sendEmailVerification(userId, 'http://localhost:5173', 'de');

		expect(await AccountMailService.verifyEmail(first)).toBe(false);
		expect(await AccountMailService.verifyEmail(lastLink(email))).toBe(true);
	});

	it('eine geänderte Adresse verliert die Bestätigung', async () => {
		await AccountMailService.sendEmailVerification(userId, 'http://localhost:5173', 'de');
		await AccountMailService.verifyEmail(lastLink(email));
		await UserService.updateUser(userId, { nickname: userId, email: 'neu@example.com', forename: '', lastname: '' });

		expect(await UserService.isEmailVerified(userId)).toBe(false);
	});

	it('meldet noEmail ohne hinterlegte Adresse', async () => {
		await User.update({ email: '' }, { where: { id: userId } });
		expect(await AccountMailService.sendEmailVerification(userId, 'http://localhost:5173', 'de')).toBe('noEmail');
	});
});

function lastResetToken(to: string): string | undefined {
	const mail = MailService.outbox()
		.filter((m) => m.to === to)
		.at(-1);
	return mail?.text.match(/reset-password\?token=([A-Za-z0-9_-]+)/)?.[1];
}

describe('Passwort-Reset', () => {
	const origin = 'http://localhost:5173';
	let userId: string;
	let nickname: string;
	let email: string;

	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		for (const model of Object.values(sequelize.models)) {
			await model.destroy({ where: {}, truncate: true, cascade: true });
		}
		const registered = await UserService.register(`reset_${Date.now()}_${Math.random()}`, 'AltesPasswort!');
		if (!registered) {
			throw new Error('Testnutzer konnte nicht angelegt werden');
		}
		userId = registered.id;
		nickname = registered.nickname;
		email = `${userId}@example.com`;
		await User.update({ email, emailVerifiedAt: new Date() }, { where: { id: userId } });
	});

	it('schickt an eine unbestätigte Adresse nichts', async () => {
		await User.update({ emailVerifiedAt: null }, { where: { id: userId } });
		await AccountMailService.requestPasswordReset(nickname, origin, 'de');
		expect(lastResetToken(email)).toBeUndefined();
	});

	it('findet das Konto über den Nickname und über die Adresse', async () => {
		await AccountMailService.requestPasswordReset(nickname, origin, 'de');
		const byNickname = lastResetToken(email);
		await AccountMailService.requestPasswordReset(email, origin, 'de');
		const byEmail = lastResetToken(email);

		expect(byNickname).toBeDefined();
		expect(byEmail).toBeDefined();
		expect(byEmail).not.toBe(byNickname);
	});

	it('bleibt still bei unbekannten Angaben', async () => {
		const before = MailService.outbox().length;
		await AccountMailService.requestPasswordReset('gibt-es-nicht', origin, 'de');
		await AccountMailService.requestPasswordReset('', origin, 'de');
		expect(MailService.outbox().length).toBe(before);
	});

	it('das Anzeigen des Formulars verbraucht den Link nicht', async () => {
		await AccountMailService.requestPasswordReset(nickname, origin, 'de');
		const token = lastResetToken(email)!;
		expect(await AccountMailService.isResetTokenValid(token)).toBe(true);
		expect(await AccountMailService.isResetTokenValid(token)).toBe(true);
	});

	it('lehnt ein Passwort gegen die Regeln ab und lässt den Link gültig', async () => {
		await AccountMailService.requestPasswordReset(nickname, origin, 'de');
		const token = lastResetToken(email)!;

		expect(await AccountMailService.resetPassword(token, '12345678')).toEqual({
			ok: false,
			error: 'auth.error.passwordTooCommon'
		});
		expect(await AccountMailService.isResetTokenValid(token)).toBe(true);
	});

	it('setzt das Passwort, verbraucht den Link und beendet die Sitzung', async () => {
		await SessionToken.create({ UserId: userId, token: 'laufende-sitzung' });
		await AccountMailService.requestPasswordReset(nickname, origin, 'de');
		const token = lastResetToken(email)!;

		expect(await AccountMailService.resetPassword(token, 'grüne gurken im mondschein')).toEqual({ ok: true });
		expect(await UserService.loginWithCredentials(nickname, 'grüne gurken im mondschein')).toBeTruthy();
		expect(await UserService.loginWithCredentials(nickname, 'AltesPasswort!')).toBeFalsy();
		expect(await SessionToken.count({ where: { UserId: userId } })).toBe(0);
		expect(await AccountMailService.resetPassword(token, 'noch ein anderes passwort')).toEqual({
			ok: false,
			error: 'invalidToken'
		});
	});

	it('lehnt einen abgelaufenen Link ab', async () => {
		await AccountMailService.requestPasswordReset(nickname, origin, 'de');
		const token = lastResetToken(email)!;
		await MailToken.update({ expiresAt: new Date(Date.now() - 1000) }, { where: { UserId: userId } });

		expect(await AccountMailService.isResetTokenValid(token)).toBe(false);
		expect(await AccountMailService.resetPassword(token, 'grüne gurken im mondschein')).toEqual({
			ok: false,
			error: 'invalidToken'
		});
	});

	it('ein Bestätigungslink taugt nicht als Reset-Link', async () => {
		await AccountMailService.sendEmailVerification(userId, origin, 'de');
		const verifyToken = lastLink(email);
		expect(await AccountMailService.resetPassword(verifyToken, 'grüne gurken im mondschein')).toEqual({
			ok: false,
			error: 'invalidToken'
		});
	});

	it('schickt höchstens drei Mails pro Stunde', async () => {
		for (let i = 0; i < 5; i++) {
			await AccountMailService.requestPasswordReset(nickname, origin, 'de');
		}
		expect(MailService.outbox().filter((m) => m.to === email)).toHaveLength(3);
	});
});
