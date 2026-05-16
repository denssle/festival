import { sequelize } from '$lib/db/sequelize';
import { error } from '@sveltejs/kit';

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
