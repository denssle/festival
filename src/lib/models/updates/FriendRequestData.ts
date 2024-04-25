import { FrontendUser } from '$lib/models/user/FrontendUser';

export interface FriendRequestData {
	id: string;
	receivedFrom: FrontendUser | undefined;
	sendTo: FrontendUser | undefined;
}
