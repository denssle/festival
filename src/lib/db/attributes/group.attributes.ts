export interface GroupAttributes {
	id: string;
	name: string;
	description: string;
	ownerId: string;
	owner?: any;
	createdAt: Date;
	updatedAt: Date;
}
