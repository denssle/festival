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
	'error.inputTooLong': 'An input is too long (at most {max} characters).',
	'error.internal': 'Internal server error.',
	'error.notFound': 'Not found.',
	'error.forbidden': "You don't have permission to do that.",

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
	'group.left': 'You have left the group.',
	'group.error.notFound': 'Group not found.',

	// Profile
	'profile.error.notFound': 'User not found.',

	// Home
	'home.heading': 'Festivals',
	'home.welcome': 'Welcome.',
	'home.newFestival': 'Create a new festival',
	'home.byAuthor': 'by {author}',
	'home.start': 'Start:',
	'home.guestCount': 'Guests so far: {count}',
	'home.empty': 'There are no festivals yet. Create the first one!',

	// About
	'about.heading': 'About this site',
	'about.credits':
		'This site was built with {svelte}. The styling comes from {simplecss} and the data is stored in a {mariadb} database.',
	'about.hosting': 'This site is hosted on {uberspace}.',
	'about.uberspaceAlt': 'uberspace banner',
	'about.version': 'Version: {version}',

	// Shared form parts
	'form.nickname': 'Nickname',
	'form.password': 'Password',
	'form.passwordRepeat': 'Repeat password',
	'form.go': "Let's go!",
	'form.save': 'Save',
	'form.cancel': 'Cancel',
	'form.back': 'Back',

	// Sign in
	'login.heading': 'Sign in',
	'login.noAccount': 'No account yet?',
	'login.registerLink': 'Sign up here.',

	// Sign up
	'registration.heading': 'Sign up',
	'registration.haveAccount': 'Already have an account?',
	'registration.loginLink': 'Sign in here.',

	// Common actions
	'action.edit': 'Edit',
	'action.delete': 'Delete',
	'common.areYouSure': 'Are you sure?',
	'error.unknown': 'Unknown error',
	'table.name': 'Name',

	// Festival: form
	'festival.new.heading': 'Create a new event',
	'festival.form.name': 'Name of the event',
	'festival.form.description': 'Short description',
	'festival.form.location': 'Location',
	'festival.bringFood': 'Guests should bring something to eat.',
	'festival.bringDrink': 'Guests should bring something to drink.',

	// Festival: details
	'festival.organisedBy': 'Organised by',
	'festival.startDate': 'Start date:',
	'festival.description': 'Description:',
	'festival.where': 'Where:',
	'festival.join': 'Attend',
	'festival.joinEdit': 'Edit attendance',
	'festival.decline': 'Decline',
	'festival.declineEdit': 'Edit absence',
	'festival.notYours': 'This is not your event.',
	'festival.error.deleteFailed': 'Deleting failed.',
	'festival.error.joinFailed': 'Signing up failed: {message}',
	'festival.error.joinNetwork': 'Network error while signing up.',
	'festival.error.declineFailed': 'Declining failed.',

	// Festival: guest lists
	'festival.coming.heading': 'Attending:',
	'festival.coming.intro': 'Signed up so far:',
	'festival.coming.food': 'Food',
	'festival.coming.drink': 'Drinks',
	'festival.coming.otherGuests': 'Additional guests',
	'festival.coming.total': 'Total',
	'festival.coming.empty': 'Nobody has signed up yet.',
	'festival.notComing.heading': 'Not attending:',
	'festival.notComing.comment': 'Comment',
	'festival.notComing.empty': 'Nobody has declined yet.',

	// Festival: attend dialog
	'festival.joinDialog.confirm': 'Join',
	'festival.joinDialog.heading': 'Count me in!',
	'festival.joinDialog.otherGuests': "I'm bringing additional guests (who aren't registered here):",
	'festival.joinDialog.food': "I'm bringing something to eat:",
	'festival.joinDialog.drink': "I'm bringing something to drink:",
	'festival.joinDialog.byo': 'Note: This is a bring-your-own party.',
	'festival.joinDialog.notByo': 'Note: This is {mark:not} a bring-your-own party.',

	// Festival: decline dialog
	'festival.declineDialog.text': "Unfortunately I / we can't make it to this event.",
	'festival.declineDialog.comment': 'Comment (optional):',

	// Groups: overview
	'group.heading': 'Groups',
	'group.intro': 'Connect with others here.',
	'group.mine': 'Your groups',
	'group.mineEmpty': "You're not in any group.",
	'group.search.heading': 'Find groups',
	'group.search.placeholder': 'Group name or description...',
	'group.search.submit': 'Search',
	'group.search.results': 'Search results for "{term}"',
	'group.search.empty': 'No groups found.',
	'group.new.section': 'New group',
	'group.new.create': 'Create a new group',

	// Groups: details
	'group.deleteConfirm': 'Are you sure you want to delete this group? This cannot be undone.',
	'group.delete': 'Delete group',
	'group.join': 'Join',
	'group.leave': 'Leave group',
	'group.members': 'Members',
	'group.owner': 'Owner',
	'group.membersEmpty': 'This group has no members.',

	// Groups: form
	'group.edit.heading': 'Edit group',
	'group.form.nameLabel': 'Name',
	'group.form.name': 'Group name',
	'group.form.descriptionLabel': 'Description',
	'group.form.description': 'Short description',

	// Profile
	'profile.heading': 'User',
	'profile.friends': 'Friends:',
	'profile.friendsEmpty': "Looks like you don't have any friends here.",
	'profile.friendsEmptyComfort': "It's surely not your fault...",
	'profile.festivals': 'Festivals:',
	'profile.groups': 'Groups:',
	'profile.groupsEmptyOther': "This user isn't in any group.",
	'profile.visiting.none': 'Not signed up for anything.',
	'profile.visiting.intro': 'Signed up for:',
	'profile.forename': 'First name:',
	'profile.lastname': 'Last name:',
	'profile.notProvided': 'Not provided',

	// Profile: form
	'profile.form.nickname': 'Your nickname:',
	'profile.form.forename': 'Your first name:',
	'profile.form.forenamePlaceholder': 'First name',
	'profile.form.lastname': 'Your last name:',
	'profile.form.lastnamePlaceholder': 'Last name',
	'profile.form.email': 'Your email:',
	'profile.form.emailPlaceholder': 'Email',

	// Profile: picture
	'profile.avatar.onlyOwn': 'Sorry, you can only change your own profile.',
	'profile.avatar.tooLarge': 'Image too large.',
	'profile.avatar.uploaded': 'Image uploaded and saved.',
	'profile.avatar.failed': 'Image upload failed.',
	'profile.avatar.upload': 'Upload image',

	// Friendships
	'friend.add': 'Add friend',
	'friend.remove': 'Remove friend',
	'friend.requestSent': 'Friend request sent.',
	'friend.requestFailed': 'Request failed.',
	'friend.removed': 'Friendship ended.',
	'updates.heading': 'Updates',
	'updates.received': 'Received friend requests',
	'updates.sent': 'Pending friend requests',
	'updates.none': 'No requests',
	'updates.accept': 'Accept',
	'updates.decline': 'Decline',
	'updates.withdraw': 'Withdraw',

	// Dialogs
	'dialog.yes': 'Yes',
	'dialog.no': 'Nope',
	'dialog.ok': 'OK',

	// Profile picture
	'profile.avatar.alt': 'Profile picture',

	// Comments
	'comment.label': 'Comment:',
	'comment.submit': 'Send',
	'comment.deleteConfirm': 'Delete comment. Are you sure?',
	'comment.empty': 'No comments yet. Write the first one!',
	'comment.written': 'Written:',
	'comment.updated': 'Updated:',

	// Settings
	'settings.heading': 'Settings',
	'settings.password.section': 'Password',
	'settings.password.currentLabel': 'Current password:',
	'settings.password.currentPlaceholder': 'Current password',
	'settings.password.newLabel': 'New password:',
	'settings.password.newPlaceholder': 'New password',
	'settings.password.repeatLabel': 'Repeat new password:',
	'settings.password.repeatPlaceholder': 'Repeat new password',
	'settings.account.delete': 'Delete account',
	'settings.account.explanation':
		"Deleting your account removes all associated data: your profile and profile picture, the festivals you created including your guests' replies, your groups, your comments, as well as friendships and open requests. Your replies to other festivals are removed too. This cannot be undone.",
	'settings.account.passwordLabel': 'Your password, to confirm:',
	'settings.account.confirm':
		'Delete your account permanently? This also removes your festivals including all replies, your groups, comments and friendships. This cannot be undone.',
	'settings.account.confirmYes': 'Delete permanently'
};
