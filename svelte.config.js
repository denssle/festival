import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-node: `vite build` erzeugt einen eigenständigen Node-Server unter build/,
		// gestartet mit `node build`. Ersetzt den früheren `vite dev`-Betrieb in Produktion
		// (schneller Start, kein npm install / Vite pro Restart).
		adapter: adapter(),
		csrf: {
			trustedOrigins: ['*']
		}
	}
};

export default config;
