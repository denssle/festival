import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '$env/dynamic/private';
import { isTestOrLocal } from '$lib/db/sequelize';

export interface OutgoingMail {
	to: string;
	subject: string;
	text: string;
}

/**
 * Wie Mails das Haus verlassen:
 * - `smtp`: Produktion mit vollständiger Konfiguration (Uberspace-Postfach, siehe CLAUDE.md §6).
 * - `outbox`: Dev-Server und Tests. Mails landen im Speicher (für die E2E-Tests abrufbar
 *   über `/api/test/mails`) und im Log – es geht nichts nach draußen.
 * - `disabled`: Produktion ohne Konfiguration. Nichts wird verschickt, jeder Versuch
 *   landet als Fehler im Log; die Oberfläche antwortet trotzdem normal.
 */
export type MailMode = 'smtp' | 'outbox' | 'disabled';

const outbox: OutgoingMail[] = [];
let transporter: Transporter | null = null;

export class MailService {
	static mode(): MailMode {
		const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, APP_ORIGIN } = env;
		if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD && MAIL_FROM && APP_ORIGIN) {
			return 'smtp';
		}
		return isTestOrLocal ? 'outbox' : 'disabled';
	}

	/**
	 * Adresse der App für Links in Mails, ohne Base-Pfad.
	 *
	 * In Produktion fest aus `APP_ORIGIN`, NICHT aus der Request-URL: Die leitet sich aus dem
	 * Host-Header ab, und den bestimmt der Absender. Sonst könnte jemand einen Reset für ein
	 * fremdes Konto anfordern und dabei seine eigene Domain unterschieben – der Link in der
	 * echten Mail zeigte dann auf ihn („Password Reset Poisoning“).
	 *
	 * @returns null, wenn Mails gar nicht verschickt werden
	 */
	static linkOrigin(requestOrigin: string): string | null {
		switch (this.mode()) {
			case 'smtp':
				// mode() === 'smtp' setzt APP_ORIGIN voraus.
				return (env.APP_ORIGIN ?? '').replace(/\/+$/, '');
			case 'outbox':
				return requestOrigin;
			case 'disabled':
				return null;
		}
	}

	/** @returns true, wenn die Mail abgegeben wurde (bei `outbox`: im Speicher gelandet) */
	static async send(mail: OutgoingMail): Promise<boolean> {
		switch (this.mode()) {
			case 'smtp':
				try {
					await this.transporter().sendMail({ from: env.MAIL_FROM, ...mail });
					return true;
				} catch (error) {
					console.error('Mailversand fehlgeschlagen:', error);
					return false;
				}
			case 'outbox':
				outbox.push(mail);
				console.info(`[Postausgang] an ${mail.to}: ${mail.subject}\n${mail.text}`);
				return true;
			case 'disabled':
				this.logNotConfigured(mail.subject);
				return false;
		}
	}

	static logNotConfigured(what: string): void {
		console.error(
			'Mailversand nicht konfiguriert (SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, APP_ORIGIN) – ' +
				`„${what}“ nicht verschickt.`
		);
	}

	/** Nur Dev/Tests: die bisher „verschickten“ Mails, neueste zuletzt. */
	static outbox(): readonly OutgoingMail[] {
		return outbox;
	}

	private static transporter(): Transporter {
		if (!transporter) {
			const port = Number(env.SMTP_PORT || 587);
			transporter = nodemailer.createTransport({
				host: env.SMTP_HOST,
				port,
				// 465: TLS von Anfang an; 587: STARTTLS, das nodemailer dann erzwingt.
				secure: port === 465,
				requireTLS: port !== 465,
				auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
			});
		}
		return transporter;
	}
}
