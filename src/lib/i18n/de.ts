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
	'group.left': 'Du hast die Gruppe verlassen.',

	// Startseite
	'home.heading': 'Festivals',
	'home.welcome': 'Willkommen hier.',
	'home.newFestival': 'Neues Fest anlegen',
	'home.by': 'von',
	'home.start': 'Start:',
	'home.guestCount': 'Bisherige Gäste: {count}',
	'home.empty': 'Es gibt noch keine Feste. Leg das erste an!',

	// About
	'about.heading': 'Über diese Seite',
	'about.builtWith': 'Diese Seite wurde erstellt mit',
	'about.stylingFrom': 'Das Styling kommt von',
	'about.dataStoredIn': 'und die Daten werden gespeichert in einer',
	'about.hostedOn': 'Die Seite ist gehostet auf',
	'about.uberspaceAlt': 'uberspace-Banner',
	'about.version': 'Version: {version}',

	// Formularbausteine
	'form.nickname': 'Nickname',
	'form.password': 'Passwort',
	'form.passwordRepeat': 'Passwort Wiederholung',
	'form.go': 'Los gehts!',
	'form.save': 'Speichern',
	'form.cancel': 'Abbrechen',
	'form.back': 'Zurück',

	// Anmeldung
	'login.heading': 'Anmeldung',
	'login.noAccount': 'Noch nicht angemeldet? Dann',
	'login.registerLink': 'hier registrieren.',

	// Registrierung
	'registration.heading': 'Registrierung',
	'registration.haveAccount': 'Bereits ein Konto?',
	'registration.loginLink': 'Hier geht es zur Anmeldung.',

	// Allgemeine Aktionen
	'action.edit': 'Bearbeiten',
	'action.delete': 'Löschen',
	'common.areYouSure': 'Bist du dir sicher?',
	'error.unknown': 'Unbekannter Fehler',
	'table.name': 'Name',

	// Festival: Formular
	'festival.new.heading': 'Neue Veranstaltung anlegen',
	'festival.form.name': 'Name der Veranstaltung',
	'festival.form.description': 'Kurze Beschreibung',
	'festival.form.location': 'Ort',
	'festival.bringFood': 'Gäste sollen etwas zu Essen mitbringen.',
	'festival.bringDrink': 'Gäste sollen etwas zu trinken mitbringen.',

	// Festival: Detailseite
	'festival.organisedBy': 'Organisiert von',
	'festival.startDate': 'Startdatum:',
	'festival.description': 'Beschreibung:',
	'festival.where': 'Wo:',
	'festival.join': 'Zusagen',
	'festival.joinEdit': 'Zusage bearbeiten',
	'festival.decline': 'Absagen',
	'festival.declineEdit': 'Absage bearbeiten',
	'festival.notYours': 'Das ist nicht dein Event.',
	'festival.error.deleteFailed': 'Löschen fehlgeschlagen.',
	'festival.error.joinFailed': 'Fehler beim Zusagen: {message}',
	'festival.error.joinNetwork': 'Netzwerkfehler beim Zusagen.',
	'festival.error.declineFailed': 'Absagen fehlgeschlagen.',

	// Festival: Gästelisten
	'festival.coming.heading': 'Zusagen:',
	'festival.coming.intro': 'Bisher haben sich angemeldet:',
	'festival.coming.food': 'Essen',
	'festival.coming.drink': 'Trinken',
	'festival.coming.otherGuests': 'Weitere Gäste',
	'festival.coming.total': 'Summe',
	'festival.coming.empty': 'Es hat noch niemand zugesagt.',
	'festival.notComing.heading': 'Absagen:',
	'festival.notComing.comment': 'Kommentar',
	'festival.notComing.empty': 'Es hat noch niemand abgesagt.',

	// Festival: Zusage-Dialog
	'festival.joinDialog.confirm': 'Beitreten',
	'festival.joinDialog.heading': 'Bei dem Event bin ich dabei!',
	'festival.joinDialog.otherGuests': 'Ich bringe weitere Gäste mit (die hier nicht angemeldet sind):',
	'festival.joinDialog.food': 'Ich bringe etwas zu essen mit:',
	'festival.joinDialog.drink': 'Ich bringe etwas zu trinken mit:',
	'festival.joinDialog.byo': 'Hinweis: Das ist eine Mitbringparty.',
	'festival.joinDialog.notByoBefore': 'Hinweis: Das ist',
	'festival.joinDialog.notByoMarked': 'keine',
	'festival.joinDialog.notByoAfter': 'Mitbringparty.',

	// Festival: Absage-Dialog
	'festival.declineDialog.text': 'Leider bin ich / sind wir bei dem Event nicht dabei.',
	'festival.declineDialog.comment': 'Kommentar (optional):',

	// Gruppen: Übersicht
	'group.heading': 'Gruppen',
	'group.intro': 'Hier kannst du dich vernetzen.',
	'group.mine': 'Deine Gruppen',
	'group.mineEmpty': 'Du bist in keiner Gruppe.',
	'group.search.heading': 'Gruppen suchen',
	'group.search.placeholder': 'Gruppenname oder Beschreibung...',
	'group.search.submit': 'Suchen',
	'group.search.results': 'Suchergebnisse für "{term}"',
	'group.search.empty': 'Keine Gruppen gefunden.',
	'group.new.section': 'Neue Gruppe',
	'group.new.create': 'Neue Gruppe anlegen',

	// Gruppen: Detailseite
	'group.deleteConfirm':
		'Bist du sicher, dass du diese Gruppe löschen möchtest? Dies kann nicht rückgängig gemacht werden.',
	'group.delete': 'Gruppe löschen',
	'group.join': 'Beitreten',
	'group.leave': 'Gruppe verlassen',
	'group.members': 'Mitglieder',
	'group.owner': 'Besitzer',
	'group.membersEmpty': 'Keine Mitglieder in dieser Gruppe.',

	// Gruppen: Formular
	'group.edit.heading': 'Gruppe bearbeiten',
	'group.form.nameLabel': 'Name',
	'group.form.name': 'Name der Gruppe',
	'group.form.descriptionLabel': 'Beschreibung',
	'group.form.description': 'Kurze Beschreibung',

	// Profil
	'profile.heading': 'Benutzer',
	'profile.friends': 'Freunde:',
	'profile.friendsEmpty': 'Es sieht so aus, als hättest du keine Freunde hier.',
	'profile.friendsEmptyComfort': 'Das liegt bestimmt nicht an dir...',
	'profile.festivals': 'Festivals:',
	'profile.groups': 'Gruppen:',
	'profile.groupsEmptyOther': 'Dieser Benutzer ist in keiner Gruppe.',
	'profile.visiting.none': 'Zu nichts angemeldet.',
	'profile.visiting.intro': 'Angemeldet bei:',
	'profile.forename': 'Vorname:',
	'profile.lastname': 'Nachname:',
	'profile.notProvided': 'Nicht hinterlegt',

	// Profil: Formular
	'profile.form.nickname': 'Dein Nickname:',
	'profile.form.forename': 'Dein Vorname:',
	'profile.form.forenamePlaceholder': 'Vorname',
	'profile.form.lastname': 'Dein Nachname:',
	'profile.form.lastnamePlaceholder': 'Nachname',
	'profile.form.email': 'Deine Email:',
	'profile.form.emailPlaceholder': 'Email',

	// Profil: Bild
	'profile.avatar.onlyOwn': 'Leider kannst du nur dein eigenes Profil ändern.',
	'profile.avatar.tooLarge': 'Bild zu groß.',
	'profile.avatar.uploaded': 'Bild erfolgreich hochgeladen und gespeichert.',
	'profile.avatar.failed': 'Bildupload gescheitert.',
	'profile.avatar.upload': 'Bild hochladen',

	// Freundschaften
	'friend.add': 'Anfreunden',
	'friend.remove': 'Freund entfernen',
	'friend.requestSent': 'Freundschaftsanfrage wurde geschickt.',
	'friend.requestFailed': 'Fehler bei Anfrage.',
	'friend.removed': 'Freundschaft gekündigt.',
	'updates.heading': 'Updates',
	'updates.received': 'Eingegangene Freundschaftsanfragen',
	'updates.sent': 'Ausstehende Freundschaftsanfragen',
	'updates.none': 'Keine Anfragen',
	'updates.accept': 'Annehmen',
	'updates.decline': 'Ablehnen',
	'updates.withdraw': 'Zurückziehen',

	// Dialoge
	'dialog.yes': 'Ja',
	'dialog.no': 'Nope',
	'dialog.ok': 'Okay',

	// Profilbild
	'profile.avatar.alt': 'Profilbild',

	// Kommentare
	'comment.label': 'Kommentar:',
	'comment.submit': 'Absenden',
	'comment.deleteConfirm': 'Kommentar löschen. Bist du dir sicher?',
	'comment.empty': 'Noch keine Kommentare. Schreib den ersten!',
	'comment.written': 'Geschrieben:',
	'comment.updated': 'Aktualisiert:',

	// Einstellungen
	'settings.heading': 'Einstellungen',
	'settings.password.section': 'Passwort',
	'settings.password.currentLabel': 'Aktuelles Passwort:',
	'settings.password.currentPlaceholder': 'Aktuelles Passwort',
	'settings.password.newLabel': 'Neues Passwort:',
	'settings.password.newPlaceholder': 'Neues Passwort',
	'settings.password.repeatLabel': 'Neues Passwort wiederholen:',
	'settings.password.repeatPlaceholder': 'Neues Passwort wiederholen',
	'settings.account.delete': 'Konto löschen',
	'settings.account.explanation':
		'Beim Löschen des Kontos werden alle zugehörigen Daten entfernt: Profil und Profilbild, die von dir angelegten Festivals samt Zu- und Absagen deiner Gäste, deine Gruppen, deine Kommentare sowie Freundschaften und offene Anfragen. Was du in fremden Festivals zugesagt hast, verschwindet ebenfalls. Der Vorgang lässt sich nicht rückgängig machen.',
	'settings.account.passwordLabel': 'Zur Bestätigung dein Passwort:',
	'settings.account.confirm':
		'Konto endgültig löschen? Damit verschwinden auch deine Festivals samt Zusagen, deine Gruppen, Kommentare und Freundschaften. Das lässt sich nicht rückgängig machen.',
	'settings.account.confirmYes': 'Endgültig löschen'
} as const;
