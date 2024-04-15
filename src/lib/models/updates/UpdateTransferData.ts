import { OutgoingFriendRequest } from '$lib/models/updates/OutgoingFriendRequest';
import { IncomingFriendRequest } from '$lib/models/updates/IncomingFriendRequest';

export interface UpdateTransferData {
	incoming: IncomingFriendRequest[];
	outgoing: OutgoingFriendRequest[];
}
