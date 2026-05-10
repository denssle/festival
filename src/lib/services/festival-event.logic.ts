export function isChangeAllowed(userId: string, ownerId: string): boolean {
	return userId === ownerId;
}
