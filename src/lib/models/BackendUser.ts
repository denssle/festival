import type { BasisUser } from '$lib/models/BasisUser';

export interface BackendUser extends BasisUser {
	id: string;
	password: string;
}
