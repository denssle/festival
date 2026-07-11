import type { FrontendUser } from '$lib/models/user/FrontendUser';
import type { GroupAttributes } from '$lib/db/attributes/group.attributes';

export interface UserTransferData {
	user: FrontendUser;
	/** Nur beim eigenen Profil gesetzt – FrontendUser enthält bewusst keine E-Mail. */
	email?: string;
	isOwnProfil: boolean;
	yourFriend: boolean;
	friendList: FrontendUser[];
	groupList: GroupAttributes[];
}
