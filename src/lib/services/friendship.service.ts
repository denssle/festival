import { Model, Op } from 'sequelize';
import type { FrontendUser } from '$lib/models/user/FrontendUser';
import { FriendAttributes } from '$lib/db/attributes/friend.attributes';
import { convertToFriendRequest, FriendRequestAttributes } from '$lib/db/attributes/friendRequest.attributes';
import { FriendRequestData } from '$lib/models/updates/FriendRequestData';
import { UserService } from '$lib/services/user.service';
import { FriendRequest } from '$lib/db/model/friendRequest';
import { Friendship } from '$lib/db/model/friendship';
import { User } from '$lib/db/model/user';

export class FriendshipService {
	static async getFriends(userId: string): Promise<FriendAttributes[]> {
		const model = await Friendship.findAll({
			where: {
				[Op.or]: [{ friend1Id: userId }, { friend2Id: userId }]
			}
		});
		return model.map((value) => value.dataValues);
	}

	static async getFriendList(userId: string): Promise<FrontendUser[]> {
		const friends = await this.getFriends(userId);
		// Alle Freund-IDs einsammeln und mit EINEM Query laden (kein N+1 pro Freund)
		const friendIds: string[] = friends.map((value) =>
			value.friend1Id === userId ? value.friend2Id : value.friend1Id
		);
		return UserService.loadFrontendUsersByIds(friendIds);
	}

	static async areFriends(userId: string, userId2: string): Promise<boolean> {
		const model = await Friendship.findOne({
			where: {
				[Op.or]: [
					{ [Op.and]: [{ friend1Id: userId }, { friend2Id: userId2 }] },
					{ [Op.and]: [{ friend1Id: userId2 }, { friend2Id: userId }] }
				]
			}
		});
		return Boolean(model);
	}

	static async friendRequestExisting(id: string, params_id: string): Promise<boolean> {
		const model: Model<FriendRequestAttributes, any> | null = await FriendRequest.findOne({
			where: {
				[Op.or]: [
					{ [Op.and]: [{ senderId: id }, { receiverId: params_id }] },
					{ [Op.and]: [{ senderId: params_id }, { receiverId: id }] }
				]
			}
		});
		return Boolean(model);
	}

	/**
	 * Prüft gerichtet, ob eine offene Anfrage existiert, bei der `receiverId` der Empfänger
	 * und `senderId` der Absender ist. Nötig, damit nur der Empfänger annehmen kann.
	 */
	static async receivedFriendRequestExists(receiverId: string, senderId: string): Promise<boolean> {
		const model: Model<FriendRequestAttributes, any> | null = await FriendRequest.findOne({
			where: { senderId: senderId, receiverId: receiverId }
		});
		return Boolean(model);
	}

	static async createFriendRequest(senderId: string, receiverId: string): Promise<void> {
		if (senderId === receiverId) {
			return;
		}
		if (await this.areFriends(senderId, receiverId)) {
			return;
		}
		if (!(await this.friendRequestExisting(senderId, receiverId))) {
			await FriendRequest.create({
				id: crypto.randomUUID(),
				senderId: senderId,
				receiverId: receiverId
			});
		}
	}

	static async getReceivedFriendRequests(receiverId: string): Promise<FriendRequestData[]> {
		const model: Model<FriendRequestAttributes, any>[] = await FriendRequest.findAll({
			where: {
				receiverId: receiverId
			},
			// Absender/Empfänger direkt mitladen (kein N+1 pro Anfrage)
			include: [
				{ model: User, as: 'sender' },
				{ model: User, as: 'receiver' }
			]
		});
		return Promise.all(model.map((value) => convertToFriendRequest(value.dataValues)));
	}

	static async getSentFriendRequests(senderId: string): Promise<FriendRequestData[]> {
		const model: Model<FriendRequestAttributes, any>[] = await FriendRequest.findAll({
			where: {
				senderId: senderId
			},
			// Absender/Empfänger direkt mitladen (kein N+1 pro Anfrage)
			include: [
				{ model: User, as: 'sender' },
				{ model: User, as: 'receiver' }
			]
		});
		return Promise.all(model.map((value) => convertToFriendRequest(value.dataValues)));
	}

	static async removeFriend(id: string, params_id: string): Promise<void> {
		await Friendship.destroy({
			where: {
				[Op.or]: [
					{ [Op.and]: [{ friend1Id: id }, { friend2Id: params_id }] },
					{ [Op.and]: [{ friend1Id: params_id }, { friend2Id: id }] }
				]
			}
		});
	}

	static async acceptFriendRequest(id: string, params_id: string) {
		// Nur der Empfänger einer offenen Anfrage darf sie annehmen – nicht der Absender selbst
		if (await this.receivedFriendRequestExists(id, params_id)) {
			await this.deleteFriendRequest(id, params_id);
			await this.addFriend(id, params_id);
		}
	}

	static async addFriend(userId: string, userId2: string): Promise<void> {
		// Der Unique-Index deckt nur (friend1Id, friend2Id) ab – die gespiegelte Zeile
		// (friend2Id, friend1Id) wäre auf DB-Ebene erlaubt. Deshalb hier prüfen.
		if (userId === userId2 || (await this.areFriends(userId, userId2))) {
			return;
		}
		await Friendship.create({
			id: crypto.randomUUID(),
			friend1Id: userId,
			friend2Id: userId2
		});
	}

	private static async deleteFriendRequest(id: string, params_id: string): Promise<void> {
		await FriendRequest.destroy({
			where: {
				[Op.or]: [
					{ [Op.and]: [{ senderId: id }, { receiverId: params_id }] },
					{ [Op.and]: [{ senderId: params_id }, { receiverId: id }] }
				]
			}
		});
	}

	static async cancelFriendRequest(id: string, params_id: string) {
		await this.deleteFriendRequest(id, params_id);
	}

	static async declineFriendRequest(id: string, params_id: string) {
		await this.deleteFriendRequest(id, params_id);
	}
}
