import { FriendRequestData } from '$lib/models/updates/FriendRequestData';
import { UserService } from '$lib/services/user.service';

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
		receivedFrom: await UserService.loadFrontEndUserById(attribute.receiverId),
		sendTo: await UserService.loadFrontEndUserById(attribute.senderId)
	};
}
