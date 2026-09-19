import type { LayoutServerLoad } from './$types';

/**
 * Reicht die Locals (angemeldeter Nutzer, aktive Sprache) an alle Seiten durch.
 * `locale` kommt aus dem `sprache`-Hook in `hooks.server.ts`.
 */
export const load: LayoutServerLoad = async ({ locals }: { locals: App.Locals }): Promise<App.Locals> => {
	return locals;
};
