import { Op } from 'sequelize';
import { SessionToken } from '$lib/db/model/sessionToken';
import { MIN_PASSWORD_LENGTH } from '$lib/constants';
import type { TranslationKey } from '$lib/i18n';
import { validateNewPassword } from '$lib/services/user.logic';
import { UserService } from '$lib/services/user.service';
import { base } from '$app/paths';
import { MailToken } from '$lib/db/model/mailToken';
import { User } from '$lib/db/model/user';
import type { MailTokenPurpose } from '$lib/db/attributes/mailToken.attributes';
import { t } from '$lib/i18n';
import type { Locale } from '$lib/i18n/locale.logic';
import { MailService } from '$lib/services/mail.service';
import {
	generateMailToken,
	hashMailToken,
	isMailTokenExpired,
	RESET_TOKEN_TTL_MS,
	VERIFY_TOKEN_TTL_MS
} from '$lib/services/mail-token.logic';
import { LoginRateLimiter } from '$lib/services/rate-limit.logic';

/**
 * Höchstens drei Mails pro Nutzer und Stunde – sonst ließe sich über „nochmal senden“
 * ein fremdes Postfach zuschütten oder das Versandlimit des Uberspace aufbrauchen.
 * Prozess-lokal wie der Login-Limiter (ein Node-Prozess, siehe rate-limit.logic.ts).
 */
const mailRateLimiter = new LoginRateLimiter({ maxAttempts: 3, windowMs: 60 * 60 * 1000 });

export type SendResult = 'sent' | 'noEmail' | 'rateLimited' | 'failed';

/** Ergebnis von `resetPassword`: Erfolg, ungültiger Link oder ein Verstoß gegen die Passwortregeln. */
export type ResetResult = { ok: true } | { ok: false; error: 'invalidToken' | TranslationKey };

/**
 * Mails rund ums Konto: Adressbestätigung und Passwort-Reset.
 * Die Links tragen ein einmaliges Token; in der DB liegt nur dessen Hash (mailTokens).
 */
export class AccountMailService {
	/**
	 * Schickt einen Bestätigungslink an die aktuell hinterlegte Adresse. Ältere, noch
	 * offene Bestätigungslinks des Nutzers verfallen dabei.
	 */
	static async sendEmailVerification(userId: string, requestOrigin: string, locale: Locale): Promise<SendResult> {
		try {
			const user = await User.findByPk(userId);
			const email: string = user?.dataValues.email?.trim() ?? '';
			if (!user || !email) {
				return 'noEmail';
			}
			const origin = MailService.linkOrigin(requestOrigin);
			if (!origin) {
				MailService.logNotConfigured('Bestätigungsmail');
				return 'failed';
			}
			if (mailRateLimiter.isBlocked(userId)) {
				return 'rateLimited';
			}
			mailRateLimiter.recordFailure(userId);

			const token = await this.issueToken(userId, 'verifyEmail', VERIFY_TOKEN_TTL_MS, email);
			const link = `${origin}${base}/verify-email?token=${encodeURIComponent(token)}`;
			const sent = await MailService.send({
				to: email,
				subject: t(locale, 'mail.verify.subject'),
				text: t(locale, 'mail.verify.body', {
					nickname: user.dataValues.nickname,
					link,
					hours: VERIFY_TOKEN_TTL_MS / (60 * 60 * 1000)
				})
			});
			return sent ? 'sent' : 'failed';
		} catch (error) {
			console.error('Bestätigungsmail fehlgeschlagen:', error);
			return 'failed';
		}
	}

	/**
	 * Löst einen Bestätigungslink ein. Er bestätigt nur, wenn die hinterlegte Adresse noch
	 * dieselbe ist, an die er ging – wer zwischendurch die Adresse ändert, bestätigt mit
	 * dem alten Link nicht die neue.
	 *
	 * @returns true, wenn die Adresse jetzt bestätigt ist
	 */
	static async verifyEmail(token: string): Promise<boolean> {
		try {
			const model = await this.findValidToken(token, 'verifyEmail');
			if (!model) {
				return false;
			}
			await model.destroy();
			const user = await User.findByPk(model.dataValues.UserId);
			if (!user || !user.dataValues.email || user.dataValues.email.trim() !== model.dataValues.email) {
				return false;
			}
			await user.update({ emailVerifiedAt: new Date() });
			return true;
		} catch (error) {
			console.error('Bestätigung fehlgeschlagen:', error);
			return false;
		}
	}

	/**
	 * „Passwort vergessen?“: Schickt einen Reset-Link, sofern zu `identifier` (Nickname oder
	 * E-Mail-Adresse) ein Konto mit **bestätigter** Adresse existiert. Sonst passiert nichts.
	 *
	 * Gibt bewusst nichts zurück: Der Aufrufer antwortet immer gleich, damit sich über das
	 * Formular nicht herausfinden lässt, welche Nicknames oder Adressen es gibt. Aus demselben
	 * Grund ruft die Route diese Methode ohne `await` auf – sonst verriete die längere
	 * Antwortzeit (DB-Schreiben, SMTP), dass es das Konto gibt. Fehler landen im Log.
	 */
	static async requestPasswordReset(identifier: string, requestOrigin: string, locale: Locale): Promise<void> {
		try {
			const value: string = identifier.trim();
			if (!value) {
				return;
			}
			const user = await User.findOne({ where: { [Op.or]: [{ nickname: value }, { email: value }] } });
			const email: string = user?.dataValues.email?.trim() ?? '';
			if (!user || !email || !user.dataValues.emailVerifiedAt) {
				return;
			}
			const origin = MailService.linkOrigin(requestOrigin);
			if (!origin) {
				MailService.logNotConfigured('Reset-Mail');
				return;
			}
			const userId: string = user.dataValues.id;
			if (mailRateLimiter.isBlocked(userId)) {
				return;
			}
			mailRateLimiter.recordFailure(userId);

			const token = await this.issueToken(userId, 'resetPassword', RESET_TOKEN_TTL_MS, email);
			await MailService.send({
				to: email,
				subject: t(locale, 'mail.reset.subject'),
				text: t(locale, 'mail.reset.body', {
					nickname: user.dataValues.nickname,
					link: `${origin}${base}/reset-password?token=${encodeURIComponent(token)}`
				})
			});
		} catch (error) {
			console.error('Reset-Mail fehlgeschlagen:', error);
		}
	}

	/** Ist der Reset-Link (noch) gültig? Prüft nur, löst nicht ein – für die Anzeige des Formulars. */
	static async isResetTokenValid(token: string): Promise<boolean> {
		try {
			return (await this.findValidToken(token, 'resetPassword')) !== null;
		} catch (error) {
			console.error('Prüfung des Reset-Links fehlgeschlagen:', error);
			return false;
		}
	}

	/**
	 * Setzt das Passwort über einen Reset-Link neu. Danach sind alle Reset-Links des Nutzers
	 * verbraucht und seine Sitzung ist beendet – wer das Konto vorher übernommen hatte,
	 * fliegt raus.
	 *
	 * Verstößt das Passwort gegen die Regeln, bleibt der Link gültig, damit man es direkt
	 * noch einmal versuchen kann.
	 */
	static async resetPassword(token: string, newPassword: string): Promise<ResetResult> {
		try {
			const model = await this.findValidToken(token, 'resetPassword');
			if (!model) {
				return { ok: false, error: 'invalidToken' };
			}
			const userId: string = model.dataValues.UserId;
			const user = await User.findByPk(userId);
			if (!user) {
				return { ok: false, error: 'invalidToken' };
			}
			const ruleViolation = validateNewPassword(newPassword, user.dataValues.nickname, MIN_PASSWORD_LENGTH);
			if (ruleViolation) {
				return { ok: false, error: ruleViolation };
			}
			const result = await UserService.updatePassword(userId, newPassword);
			if (result !== 'Success') {
				return { ok: false, error: 'invalidToken' };
			}
			await MailToken.destroy({ where: { UserId: userId, purpose: 'resetPassword' } });
			await SessionToken.destroy({ where: { UserId: userId } });
			return { ok: true };
		} catch (error) {
			console.error('Passwort-Reset fehlgeschlagen:', error);
			return { ok: false, error: 'invalidToken' };
		}
	}

	/** Legt ein neues Token an und entwertet alle offenen desselben Zwecks. */
	private static async issueToken(
		userId: string,
		purpose: MailTokenPurpose,
		ttlMs: number,
		email: string | null
	): Promise<string> {
		const { token, tokenHash } = generateMailToken();
		await this.removeExpiredTokens();
		await MailToken.destroy({ where: { UserId: userId, purpose } });
		await MailToken.create({
			id: crypto.randomUUID(),
			UserId: userId,
			purpose,
			tokenHash,
			email,
			expiresAt: new Date(Date.now() + ttlMs)
		});
		return token;
	}

	private static async findValidToken(token: string, purpose: MailTokenPurpose) {
		if (!token) {
			return null;
		}
		const model = await MailToken.findOne({ where: { tokenHash: hashMailToken(token), purpose } });
		if (!model) {
			return null;
		}
		if (isMailTokenExpired(new Date(model.dataValues.expiresAt))) {
			await model.destroy();
			return null;
		}
		return model;
	}

	/** Räumt abgelaufene Tokens aller Nutzer weg – bei jeder neuen Ausgabe mit erledigt. */
	private static async removeExpiredTokens(): Promise<void> {
		await MailToken.destroy({ where: { expiresAt: { [Op.lte]: new Date() } } });
	}
}
