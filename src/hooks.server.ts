import { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { UserService } from '$lib/services/user.service';
import { startDB } from '$lib/db/db';
import { CurrentUser } from '$lib/models/user/CurrentUser';
import { base } from '$app/paths';
import { SESSION_COOKIE_PATH } from '$lib/constants';

await startDB();

// Impressum und Datenschutzerklärung müssen ohne Anmeldung erreichbar sein – gerade
// vor der Registrierung, wo die Einwilligung in die Datenverarbeitung fällt.
const noAuthURLs: string[] = ['/login', '/registration', '/about', '/impressum', '/datenschutz'];

// "A man is not dead while his name is still spoken." - Terry Pratchett (gest. 2015).
// In der Scheibenwelt haelt der Signalcode GNU einen Namen in den Klackertuermen im
// Umlauf, statt ihn zuzustellen; im Netz macht das dieser Kopf. Er wird von niemandem
// ausgewertet und aendert nichts an der Anwendung - er faehrt einfach mit.
// Siehe https://gnuterrypratchett.com/
//
// Steht bewusst als eigener Hook VOR der Anmeldepruefung: so bekommt jede Antwort den
// Kopf, auch der 303 auf /login und die Fehlerseiten. Statische Dateien bedient
// adapter-node an den Hooks vorbei, die bleiben ohne.
const clacks: Handle = async ({ event, resolve }): Promise<Response> => {
	const response: Response = await resolve(event);
	response.headers.set('X-Clacks-Overhead', 'GNU Terry Pratchett');
	return response;
};

const authentifizierung: Handle = async ({ event, resolve }): Promise<Response> => {
	// Die App laeuft unter dem Base-Pfad (siehe svelte.config.js), `event.url.pathname`
	// enthaelt ihn also. Einmal abschneiden, damit alle Vergleiche unten mit den
	// route-eigenen Pfaden arbeiten koennen ('/festival/login' -> '/login').
	const pathname: string = event.url.pathname.slice(base.length) || '/';

	if (pathname.startsWith('/_app/') || pathname.startsWith('/favicon')) {
		return resolve(event);
	}

	// Readiness-Check vor der Session-Auflösung durchreichen: Er soll gerade dann noch
	// antworten, wenn die DB nicht erreichbar ist – die Session-Prüfung unten würde in
	// dem Fall (bei gesetztem Cookie) selbst werfen und den Check unbrauchbar machen.
	if (pathname === '/api/health') {
		return resolve(event);
	}

	// Der Cookie enthält nur einen opaken Zufalls-Token; die Identität kommt aus der DB.
	const sessionToken: string | undefined = event.cookies.get('session');
	const currentUser: CurrentUser | null = await UserService.getCurrentUserBySessionToken(sessionToken);

	if (currentUser) {
		event.locals.currentUser = currentUser;
	} else {
		event.locals.currentUser = undefined;
		if (sessionToken) {
			// Ungültiger/abgelaufener Token: Cookie aufräumen (DB-Cleanup übernimmt
			// getCurrentUserBySessionToken bei Ablauf selbst)
			event.cookies.delete('session', { path: SESSION_COOKIE_PATH });
		}
	}

	if (noAuthURLs.includes(pathname) || currentUser) {
		return resolve(event);
	} else {
		// Bewusst `${base}` statt resolve(): resolve() liefert einen RELATIVEN Pfad
		// ('./login'), den der Browser gegen die angefragte Ressource auflöst. Bei einem
		// Datenrequest (z. B. /festival/settings/__data.json nach invalidateAll()) landet
		// das Ziel dann nicht auf der Login-Seite. Ein Location-Header braucht hier den
		// absoluten Pfad. In SvelteKits eigenem redirect() ist resolve() dagegen korrekt,
		// weil es gegen die Request-URL aufgelöst wird.
		return new Response('Redirect', { status: 303, headers: { Location: `${base}/login` } });
	}
};

export const handle: Handle = sequence(clacks, authentifizierung);
