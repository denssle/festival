import { FriendRequestData } from '$lib/models/updates/FriendRequestData';

export interface UpdateTransferData {
	receivedFriendRequests: FriendRequestData[];
	sentFriendRequests: FriendRequestData[];
}
