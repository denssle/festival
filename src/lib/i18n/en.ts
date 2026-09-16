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
	'language.en': 'English',

	// Cross-cutting errors
	'error.notAuthenticated': 'Not signed in.',
	'error.nameRequired': 'A name is required.',
	'error.nicknameInvalid': 'Invalid nickname.',
	'error.missingData': 'Required information is missing.',
	'error.internal': 'Internal server error.',

	// Sign in and sign up
	'auth.error.credentialsMissing': 'Nickname and/or password missing.',
	'auth.error.passwordInvalid': 'Invalid password.',
	'auth.error.rateLimited': 'Too many failed attempts. Please try again later.',
	'auth.error.passwordTooShort': 'The password must be at least {min} characters long.',
	'auth.error.userCreationFailed': 'The account could not be created.',
	'auth.error.currentPasswordRequired': 'Please enter your current password.',
	'auth.error.newPasswordRequired': 'Please enter the new password and its repetition.',
	'auth.error.passwordsDoNotMatch': 'The passwords do not match.',

	// ChangeResult values (see de.ts)
	'changeResult.success': 'Done.',
	'changeResult.notAuthorized': 'You are not allowed to do that.',
	'changeResult.dataMissing': 'Required information is missing.',
	'changeResult.alreadyInGroup': 'You are already a member of this group.',
	'changeResult.failure': 'The action failed.',

	// Settings
	'settings.password.changed': 'Password changed.',
	'settings.password.changeFailed': 'Changing the password failed.',
	'settings.password.currentIncorrect': 'The current password is incorrect.',
	'settings.account.deletionFailed': 'Deleting the account failed.',
	'settings.account.passwordRequired': 'Your password is required to delete the account.',

	// Profile
	'profile.updated': 'Profile updated.',
	'profile.error.updateFailed': 'The update failed.',
	'profile.error.emailInUse': 'That email address is already in use.',

	// Festivals
	'festival.error.notFound': 'Festival not found.',
	'festival.error.creationFailed': 'The festival could not be created.',
	'festival.error.missingIdOrName': 'Festival ID or name is missing.',

	// Groups
	'group.joined': 'You have joined the group.',
	'group.left': 'You have left the group.'
};
