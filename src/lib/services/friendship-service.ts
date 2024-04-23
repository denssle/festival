import { Friend, FriendRequest } from '$lib/db/db';
import { Model, Op } from 'sequelize';
import type { FrontendUser } from '$lib/models/user/FrontendUser';
import { FriendAttributes } from '$lib/db/attributes/FriendAttributes';
import { convertToFriendRequest, FriendRequestAttributes } from '$lib/db/attributes/FriendRequestAttributes';
import { FriendRequestData } from '$lib/models/updates/FriendRequestData';
import { loadFrontEndUserById } from '$lib/services/user-service';

export async function getFriends(userId: string): Promise<{ id: string; friend1Id: string; friend2Id: string }[]> {
	const model = await Friend.findAll({
		where: {
			[Op.or]: [
				{
					friend1Id: userId
				},
				{
					friend2Id: userId
				}
			]
		}
	});
	return model.map((value) => value.dataValues);
}

export async function getFriendList(userId: string): Promise<(FrontendUser | undefined)[]> {
	const friends: { id: string; friend1Id: string; friend2Id: string }[] = await getFriends(userId);
	return await Promise.all(
		friends
			.map((value) => {
				if (value.friend1Id === userId) {
					return loadFrontEndUserById(value.friend2Id);
				} else {
					return loadFrontEndUserById(value.friend1Id);
				}
			})
			.filter((value) => Boolean(value))
	);
}

export async function areFriends(userId: string, userId2: string): Promise<boolean> {
	const model: Model<FriendAttributes, any> | null = await Friend.findOne({
		where: {
			[Op.and]: [
				{
					friend1Id: [userId, userId2]
				},
				{
					friend2Id: [userId, userId2]
				}
			]
		}
	});
	return Boolean(model);
}

export async function friendRequestExisting(id: string, params_id: string): Promise<boolean> {
	const model: Model<FriendRequestAttributes, any> | null = await FriendRequest.findOne({
		where: {
			[Op.and]: [
				{
					senderId: [id, params_id]
				},
				{
					receiverId: [id, params_id]
				}
			]
		}
	});
	return Boolean(model);
}

export async function createFriendRequest(senderId: string, receiverId: string): Promise<void> {
	if (!(await friendRequestExisting(senderId, receiverId))) {
		await FriendRequest.create({
			id: crypto.randomUUID(),
			senderId: senderId,
			receiverId: receiverId
		});
	}
}

export async function getReceivedFriendRequests(receiverId: string): Promise<FriendRequestData[]> {
	const model: Model<FriendRequestAttributes, any>[] = await FriendRequest.findAll({
		where: {
			receiverId: receiverId
		}
	});
	return Promise.all(model.map((value) => convertToFriendRequest(value.dataValues)));
}

export async function getSentFriendRequests(senderId: string): Promise<FriendRequestData[]> {
	const model: Model<FriendRequestAttributes, any>[] = await FriendRequest.findAll({
		where: {
			senderId: senderId
		}
	});
	return Promise.all(model.map((value) => convertToFriendRequest(value.dataValues)));
}

export async function removeFriend(id: string, params_id: string): Promise<void> {
	await Friend.destroy({
		where: {
			[Op.and]: [
				{
					friend1Id: [id, params_id]
				},
				{
					friend2Id: [id, params_id]
				}
			]
		}
	});
}

export async function acceptFriendRequest(id: string, params_id: string) {
	if (await friendRequestExisting(id, params_id)) {
		await deleteFriendRequest(id, params_id);
		await addFriend(id, params_id);
	}
}

export async function addFriend(userId: string, userId2: string): Promise<void> {
	await Friend.create({
		id: crypto.randomUUID(),
		friend1Id: userId,
		friend2Id: userId2
	});
}

async function deleteFriendRequest(id: string, params_id: string): Promise<void> {
	await FriendRequest.destroy({
		where: {
			[Op.and]: [
				{
					senderId: [id, params_id]
				},
				{
					receiverId: [id, params_id]
				}
			]
		}
	});
}

export async function cancelFriendRequest(id: string, params_id: string) {
	await deleteFriendRequest(id, params_id);
}

export async function declineFriendRequest(id: string, params_id: string) {
	await deleteFriendRequest(id, params_id);
}