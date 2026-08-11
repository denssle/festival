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
		paths: {
			// Die App wird unter https://enzlor.uber.space/festival ausgeliefert; die
			// Wurzel der Domain gehoert einem anderen Projekt. SvelteKit stellt diesen
			// Praefix allen Asset- und Formular-URLs voran. Im Code deshalb NIE absolute
			// Pfade verwenden, sondern `resolve()` aus '$app/paths' (Client wie Server) -
			// das setzt den Praefix automatisch. Auf dem Host reicht der Praefix
			// unveraendert an die App durch (`uberspace web backend set /festival`, ohne
			// --remove-prefix), weshalb `event.url.pathname` ihn ebenfalls enthaelt.
			base: '/festival'
		},
		csrf: {
			trustedOrigins: ['*']
		}
	}
};

export default config;
