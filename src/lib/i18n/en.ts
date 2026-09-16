import type { Dictionary } from './index';

/**
 * Englisches Wörterbuch.
 *
 * Die Typannotation `Dictionary` ist der eigentliche Schutz: Fehlt ein Schlüssel aus
 * `de.ts`, schlägt `npm run check` fehl. Nicht entfernen und nicht durch `as const`
 * ersetzen – dann prüft TypeScript nur noch die Werte, nicht mehr die Vollständigkeit.
 */
export const en: Dictionary = {
	// Header
	'nav.festivals': 'Festivals',
	'nav.groups': 'Groups',
	'nav.updates': 'Updates',
	'nav.settings': 'Settings',
	'nav.logout': 'Log out',
	'nav.login': 'Sign in',
	'nav.register': 'Sign up',

	// Footer
	'footer.about': 'About',
	'footer.imprint': 'Legal notice',
	'footer.privacy': 'Privacy',

	// Language switcher – endonyms, identical in both dictionaries on purpose (see de.ts).
	'language.label': 'Language',
	'language.de': 'Deutsch',
	'language.en': 'English'
};
