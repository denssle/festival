import type { BaseUser } from '$lib/models/user/BaseUser';

export interface BackendUser extends BaseUser {
	password: string;
}
