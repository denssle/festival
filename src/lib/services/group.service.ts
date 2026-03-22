import { Group } from '$lib/db/model/group';
import { GroupMember } from '$lib/db/model/groupMember';
import { GroupAttributes } from '$lib/db/attributes/group.attributes';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { Op } from 'sequelize';

export class GroupService {
	static async createGroup(userId: string, name: File | string, description: FormDataEntryValue | null): Promise<string> {
		const groupId = crypto.randomUUID();
		try {
			await Group.create({
				id: groupId,
				name: name,
				description: description,
				ownerId: userId
			});

			await GroupMember.create({
				id: crypto.randomUUID(),
				UserId: userId,
				GroupId: groupId
			});

			return groupId;
		} catch (error) {
			console.error('Fehler beim Erstellen der Gruppe:', error);
			throw error;
		}
	}

	static async deleteGroup(userId: string, groupId: string): Promise<ChangeResult> {
		const groupModel = await Group.findByPk(groupId);
		if (groupModel && userId) {
			if (this.isChangeAllowed(userId, groupModel.dataValues as GroupAttributes)) {
				await groupModel.destroy();
				return 'Success';
			} else {
				return 'Not authorized';
			}
		}
		return 'Data Missing';
	}

	static async updateGroup(userId: string, groupId: string, name: string, description: string): Promise<ChangeResult> {
		const groupModel = await Group.findByPk(groupId);
		if (groupModel && userId) {
			if (this.isChangeAllowed(userId, groupModel.dataValues as GroupAttributes)) {
				await groupModel.update({
					name: name,
					description: description
				});
				return 'Success';
			} else {
				return 'Not authorized';
			}
		}
		return 'Data Missing';
	}

	static async searchGroups(searchTerm: string): Promise<GroupAttributes[]> {
		const groups = await Group.findAll({
			where: {
				[Op.or]: [
					{ name: { [Op.like]: `%${searchTerm}%` } },
					{ description: { [Op.like]: `%${searchTerm}%` } }
				]
			}
		});
		return groups.map((g) => g.dataValues as GroupAttributes);
	}

	static async getGroupsByUserId(userId: string): Promise<GroupAttributes[]> {
		const members = await GroupMember.findAll({
			where: { UserId: userId },
			include: [{ model: Group, as: 'Group' }]
		});

		return members.map((m: any) => m.Group?.dataValues as GroupAttributes).filter(Boolean);
	}

	static async joinGroup(userId: string, groupId: string): Promise<ChangeResult> {
		try {
			const existingMember = await GroupMember.findOne({
				where: {
					UserId: userId,
					GroupId: groupId
				}
			});

			if (existingMember) {
				return 'Already in Group';
			}

			await GroupMember.create({
				id: crypto.randomUUID(),
				UserId: userId,
				GroupId: groupId
			});

			return 'Success';
		} catch (error) {
			console.error('Fehler beim Beitreten der Gruppe:', error);
			return 'Failure';
		}
	}

	static async leaveGroup(userId: string, groupId: string): Promise<ChangeResult> {
		try {
			const groupModel = await Group.findByPk(groupId);
			if (!groupModel) {
				return 'Data Missing';
			}

			// Der Besitzer darf die Gruppe nicht verlassen (er muss sie löschen)
			if (groupModel.dataValues.ownerId === userId) {
				return 'Not authorized';
			}

			const deletedCount = await GroupMember.destroy({
				where: {
					UserId: userId,
					GroupId: groupId
				}
			});

			if (deletedCount > 0) {
				return 'Success';
			} else {
				return 'Failure';
			}
		} catch (error) {
			console.error('Fehler beim Verlassen der Gruppe:', error);
			return 'Failure';
		}
	}

	private static isChangeAllowed(userId: string, dataValues: GroupAttributes): boolean {
		return dataValues.ownerId === userId;
	}
}
