import { error, json } from '@sveltejs/kit';
import { MailService } from '$lib/services/mail.service';

/**
 * GET /api/test/mails
 *
 * Die im Postausgang gelandeten Mails (siehe `MailService`, Modus `outbox`), damit
 * E2E-Tests Links aus Bestätigungs- und Reset-Mails abrufen können.
 * Nur im Playwright-Testmodus verfügbar – wie `/api/test/reset`.
 *
 * @returns 200 mit JSON-Array der Mails, 403 außerhalb des Testmodus
 */
export async function GET(): Promise<Response> {
	if (process.env.PLAYWRIGHT !== 'true') {
		throw error(403, 'Forbidden');
	}
	return json(MailService.outbox());
}
