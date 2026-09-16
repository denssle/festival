/**
 * Deutsches Wörterbuch – die REFERENZ.
 *
 * Aus den Schlüsseln dieser Datei leitet sich `TranslationKey` ab; `en.ts` ist auf
 * `Record<TranslationKey, string>` typisiert. Ein hier ergänzter Schlüssel lässt also
 * den Type-Check fehlschlagen, solange die englische Entsprechung fehlt – das ersetzt
 * das Tooling, das eine i18n-Bibliothek mitbrächte (siehe TODO.md, Punkt Mehrsprachigkeit).
 *
 * Konvention für Schlüssel: `bereich.was`, flach statt verschachtelt (gibt in der IDE
 * eine vollständige Autovervollständigung und erspart getypte Pfad-Lookups).
 * Platzhalter in geschweiften Klammern: `'Organisiert von {nickname}'`.
 *
 * Stand: Gerüst (Schritt 1). Die restliche Oberfläche folgt in Schritt 4.
 */
export const de = {
	// Kopfzeile
	'nav.festivals': 'Festivals',
	'nav.groups': 'Gruppen',
	'nav.updates': 'Updates',
	'nav.settings': 'Einstellungen',
	'nav.logout': 'Logout',
	'nav.login': 'Anmelden',
	'nav.register': 'Registrieren',

	// Fußzeile
	'footer.about': 'About',
	'footer.imprint': 'Impressum',
	'footer.privacy': 'Datenschutz',

	// Sprachumschalter. Die Sprachnamen stehen bewusst in BEIDEN Wörterbüchern gleich
	// (Endonyme): Wer die Oberfläche auf Englisch hat und zurück nach Deutsch will,
	// sucht nach "Deutsch", nicht nach "German".
	'language.label': 'Sprache',
	'language.de': 'Deutsch',
	'language.en': 'English'
} as const;
