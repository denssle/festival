import type { BaseUser } from '$lib/models/BaseUser';

export interface BackendUser extends BaseUser {
	id: string;
	password: string;
}
