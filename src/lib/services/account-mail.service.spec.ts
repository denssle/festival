import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { sequelize } from '$lib/db/sequelize';
import { User } from '$lib/db/model/user';
import { MailToken } from '$lib/db/model/mailToken';
import { AccountMailService } from '$lib/services/account-mail.service';
import { MailService } from '$lib/services/mail.service';
import { UserService } from '$lib/services/user.service';

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
