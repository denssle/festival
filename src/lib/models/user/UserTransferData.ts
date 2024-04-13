import type { FrontendUser } from '$lib/models/user/FrontendUser';

export interface UserTransferData {
	user: FrontendUser;
	isOwnProfil: boolean,
	yourFriend: boolean,
	friends: (FrontendUser | undefined)[]
}