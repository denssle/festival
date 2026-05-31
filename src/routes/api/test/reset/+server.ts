import { sequelize } from '$lib/db/sequelize';
import { error } from '@sveltejs/kit';

/**
 * POST /api/test/reset
 *
 * Setzt die gesamte Datenbank zurück (alle Tabellen werden geleert).
 * Nur im Playwright-Testmodus verfügbar (Umgebungsvariable PLAYWRIGHT=true).
 * Wird ausschließlich für automatisierte End-to-End-Tests verwendet.
 *
 * @returns 200 mit { success: true } bei Erfolg,
 *          403 wenn nicht im Testmodus,
 *          500 bei Datenbankfehler
 */
export async function POST(): Promise<Response> {
	if (process.env.PLAYWRIGHT !== 'true') {
		throw error(403, 'Forbidden');
	}

	try {
		const models = Object.values(sequelize.models);
		for (const model of models) {
			await model.destroy({ where: {}, truncate: true, cascade: true });
		}
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (e) {
		console.error('Failed to reset DB:', e);
		throw error(500, 'Failed to reset DB');
	}
}
