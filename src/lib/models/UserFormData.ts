import type { BasisUser } from '$lib/models/BasisUser';

export interface UserFormData extends BasisUser {
	password: string;
}
