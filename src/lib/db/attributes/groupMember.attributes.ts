import type { Model, Optional } from 'sequelize';
import type { GroupAttributes, GroupCreationAttributes } from '$lib/db/attributes/group.attributes';
import type { UserAttributes, UserCreationAttributes } from '$lib/db/attributes/user.attributes';

export interface GroupMemberAttributes {
	id: string;
	GroupId: string;
	UserId: string;
	createdAt: Date;
	updatedAt: Date;
	// Optional eager-geladene Assoziationen (via include: { model: Group/User, as: 'Group'/'User' }).
	Group?: Model<GroupAttributes, GroupCreationAttributes>;
	User?: Model<UserAttributes, UserCreationAttributes>;
}

/** Attribute beim Anlegen: Pflicht sind nur `id`, `GroupId` und `UserId`. */
export type GroupMemberCreationAttributes = Optional<
	GroupMemberAttributes,
	'createdAt' | 'updatedAt' | 'Group' | 'User'
>;
