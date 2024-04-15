import { FrontendUser } from '$lib/models/user/FrontendUser';

export interface OutgoingFriendRequest {
	id: string;
	requestedTo: FrontendUser | undefined;
}
