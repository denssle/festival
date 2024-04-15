import { FrontendUser } from '$lib/models/user/FrontendUser';

export interface IncomingFriendRequest {
	id: string;
	requestedBy: FrontendUser | undefined;
}
