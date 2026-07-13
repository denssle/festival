import { Group } from '$lib/db/model/group';
import { GroupMember } from '$lib/db/model/groupMember';
import { GroupAttributes } from '$lib/db/attributes/group.attributes';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { Op } from 'sequelize';
import { sequelize } from '$lib/db/sequelize';

export class GroupService {
	static async createGroup(userId: string, name: string, description: string): Promise<string> {
		const groupId = crypto.randomUUID();
		try {
			// Gruppe und Besitzer-Mitgliedschaft atomar anlegen, damit keine besitzerlose Gruppe entstehen kann
			await sequelize.transaction(async (t) => {
				await Group.create(
					{
						id: groupId,
						name: name,
						description: description,
						ownerId: userId
					},
					{ transaction: t }
				);

				await GroupMember.create(
					{
						id: crypto.randomUUID(),
						UserId: userId,
						GroupId: groupId
					},
					{ transaction: t }
				);
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
		// LIKE-Wildcards (%, _) sowie das Escape-Zeichen (\) aus der Eingabe maskieren,
		// damit z. B. '%' nicht alle Gruppen matcht (Sequelize parametrisiert nur gegen
		// SQL-Injection, nicht gegen LIKE-Pattern-Missbrauch).
		const pattern = `%${this.escapeLikePattern(searchTerm)}%`;
		const groups = await Group.findAll({
			where: {
				[Op.or]: [{ name: { [Op.like]: pattern } }, { description: { [Op.like]: pattern } }]
			}
		});
		return groups.map((g) => g.dataValues as GroupAttributes);
	}

	private static escapeLikePattern(input: string): string {
		return input.replace(/[\\%_]/g, (char) => `\\${char}`);
	}

	static async getGroupsByUserId(userId: string): Promise<GroupAttributes[]> {
		const members = await GroupMember.findAll({
			where: { UserId: userId },
			include: [{ model: Group, as: 'Group' }]
		});

		return members
			.map((m) => m.dataValues.Group?.dataValues)
			.filter((group): group is GroupAttributes => group !== undefined);
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
