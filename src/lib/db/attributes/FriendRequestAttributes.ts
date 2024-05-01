import { loadFrontEndUserById } from '$lib/services/user-service';
import { FriendRequestData } from '$lib/models/updates/FriendRequestData';

export type FriendRequestAttributes = {
	id: string;
	senderId: string;
	receiverId: string;
	createdAt: Date;
	updatedAt: Date;
};

export async function convertToFriendRequest(attribute: FriendRequestAttributes): Promise<FriendRequestData> {
	return {
		id: attribute.id,
		receivedFrom: await loadFrontEndUserById(attribute.receiverId),
		sendTo: await loadFrontEndUserById(attribute.senderId)
	};
}
