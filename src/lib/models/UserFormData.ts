import type { BaseUser } from '$lib/models/BaseUser';

export interface UserFormData extends BaseUser {
	password: string;
}
