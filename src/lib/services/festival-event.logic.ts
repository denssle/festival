export function isChangeAllowed(userId: string, ownerId: string): boolean {
	return userId === ownerId;
}

/**
 * Wer ein Festival sehen – und damit zu-/absagen und kommentieren – darf (entschieden 2026-09-30):
 * der Ersteller, seine Freunde und alle, die schon geantwortet haben. Letzteres hält das
 * Festival für Gäste offen, deren Freundschaft zum Ersteller inzwischen beendet ist, und
 * lässt sie ihre Antwort weiter ändern.
 */
export function canSeeFestival(
	userId: string,
	ownerId: string,
	isFriendOfOwner: boolean,
	hasAnswered: boolean
): boolean {
	return userId === ownerId || isFriendOfOwner || hasAnswered;
}
