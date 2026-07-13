import type { Model, Optional } from 'sequelize';
import type { UserAttributes, UserCreationAttributes } from '$lib/db/attributes/user.attributes';

export interface GroupAttributes {
	id: string;
	name: string;
	description: string;
	ownerId: string;
	// Optional eager-geladener Besitzer (via include: { model: User, as: 'owner' }).
	owner?: Model<UserAttributes, UserCreationAttributes>;
	createdAt: Date;
	updatedAt: Date;
}

/** Attribute beim Anlegen: Pflicht sind nur `id`, `name` und `ownerId`. */
export type GroupCreationAttributes = Optional<GroupAttributes, 'createdAt' | 'updatedAt' | 'description' | 'owner'>;
