import type { BasisUser } from '$lib/models/BasisUser';

export interface FrontendUser extends BasisUser {
	id: string;
}
