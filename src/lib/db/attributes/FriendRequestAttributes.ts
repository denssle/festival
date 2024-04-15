import { IncomingFriendRequest } from '$lib/models/updates/IncomingFriendRequest';
import { OutgoingFriendRequest } from '$lib/models/updates/OutgoingFriendRequest';
import { loadFrontEndUserById } from '$lib/services/user-service';

export type FriendRequestAttributes = {
	id: string;
	requesterId: string;
	requestedId: string;
	createdAt: Date;
	updatedAt: Date;
};

export async function convertToIncomingFriendRequest(
	attribute: FriendRequestAttributes
): Promise<IncomingFriendRequest> {
	return {
		id: attribute.id,
		requestedBy: await loadFrontEndUserById(attribute.requestedId)
	};
}

export async function convertToOutgoingFriendRequest(
	attribute: FriendRequestAttributes
): Promise<OutgoingFriendRequest> {
	return {
		id: attribute.id,
		requestedTo: await loadFrontEndUserById(attribute.requesterId)
	};
}
