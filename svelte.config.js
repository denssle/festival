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
		// CSRF-Schutz: Formular-POSTs (auch text/plain und multipart) nur von der eigenen
		// Adresse. Bis v0.7.63 stand hier `['*']` – das schaltet die Pruefung komplett ab
		// (eingefuehrt 2024 als "disable csrf for testing"). Die Session haelt zusaetzlich
		// `sameSite: 'strict'` ab.
		//
		// Die oeffentlichen Adressen stehen ausdruecklich hier, statt sich auf die
		// Erkennung hinter dem Proxy zu verlassen: adapter-node nimmt als eigenen Origin
		// `https://` + Host-Header an, und ob nginx den Host durchreicht, ist Sache des
		// Uberspace. So funktionieren Formulare in Produktion unabhaengig davon.
		// Achtung: Die Pruefung laeuft NUR im Build, nicht unter `vite dev` - Playwright
		// sieht sie nie, abgesichert ist sie im Smoke-Test (scripts/smoke-test.sh).
		csrf: {
			trustedOrigins: ['https://enzlor.uber.space', 'https://festival.enzlor.uber.space']
		}
	}
};

export default config;
