import type { FrontendUser } from '$lib/models/user/FrontendUser';
import type { GroupAttributes } from '$lib/db/attributes/group.attributes';

export interface UserTransferData {
	user: FrontendUser;
	isOwnProfil: boolean;
	yourFriend: boolean;
	friendList: (FrontendUser | undefined)[];
	groupList: GroupAttributes[];
}
