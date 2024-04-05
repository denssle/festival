import type { BaseUser } from '$lib/models/BaseUser';

export interface BackendUser extends BaseUser {
	password: string;
	created: number;
}
