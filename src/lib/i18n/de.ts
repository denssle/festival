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
	'language.en': 'English',

	// Übergreifende Fehler. Bewusst geteilt statt pro Route dupliziert – vorher stand
	// dieselbe Aussage mehrfach im Code, teils auf Deutsch, teils auf Englisch.
	'error.notAuthenticated': 'Nicht angemeldet.',
	'error.nameRequired': 'Name ist erforderlich.',
	'error.nicknameInvalid': 'Ungültiger Nickname.',
	'error.missingData': 'Es fehlen Angaben.',
	'error.internal': 'Interner Serverfehler.',

	// Anmeldung und Registrierung
	'auth.error.credentialsMissing': 'Nickname und/oder Passwort fehlen.',
	'auth.error.passwordInvalid': 'Passwort ungültig.',
	'auth.error.rateLimited': 'Zu viele Fehlversuche. Bitte später erneut versuchen.',
	'auth.error.passwordTooShort': 'Das Passwort muss mindestens {min} Zeichen lang sein.',
	'auth.error.userCreationFailed': 'Der Benutzer konnte nicht angelegt werden.',
	'auth.error.currentPasswordRequired': 'Bitte das aktuelle Passwort angeben.',
	'auth.error.newPasswordRequired': 'Bitte das neue Passwort und die Wiederholung angeben.',
	'auth.error.passwordsDoNotMatch': 'Die Passwörter stimmen nicht überein.',

	// Übersetzung der ChangeResult-Werte. Die Enumwerte selbst ('Not authorized', …) sind
	// Ergebniscodes und blieben bisher unübersetzt in der Oberfläche stehen.
	'changeResult.success': 'Erfolgreich.',
	'changeResult.notAuthorized': 'Dazu bist du nicht berechtigt.',
	'changeResult.dataMissing': 'Es fehlen Angaben.',
	'changeResult.alreadyInGroup': 'Du bist bereits Mitglied dieser Gruppe.',
	'changeResult.failure': 'Die Aktion ist fehlgeschlagen.',

	// Einstellungen
	'settings.password.changed': 'Passwort geändert.',
	'settings.password.changeFailed': 'Die Passwortänderung ist fehlgeschlagen.',
	'settings.password.currentIncorrect': 'Das aktuelle Passwort ist falsch.',
	'settings.account.deletionFailed': 'Die Löschung des Kontos ist fehlgeschlagen.',
	'settings.account.passwordRequired': 'Zum Löschen des Kontos ist das Passwort erforderlich.',

	// Profil
	'profile.updated': 'Profil aktualisiert.',
	'profile.error.updateFailed': 'Die Aktualisierung ist fehlgeschlagen.',
	'profile.error.emailInUse': 'Diese E-Mail-Adresse wird bereits verwendet.',

	// Festivals
	'festival.error.notFound': 'Festival nicht gefunden.',
	'festival.error.creationFailed': 'Das Festival konnte nicht angelegt werden.',
	'festival.error.missingIdOrName': 'Festival-ID oder Name fehlt.',

	// Gruppen
	'group.joined': 'Du bist der Gruppe erfolgreich beigetreten!',
	'group.left': 'Du hast die Gruppe verlassen.'
} as const;
