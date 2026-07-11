import { FriendRequestData } from '$lib/models/updates/FriendRequestData';
import { UserService } from '$lib/services/user.service';
import { Model } from 'sequelize';
import { convertToBackendUser, UserAttributes } from '$lib/db/attributes/user.attributes';

export type FriendRequestAttributes = {
	id: string;
	senderId: string;
	receiverId: string;
	createdAt: Date;
	updatedAt: Date;
	// Optional eager-geladene Nutzer (via include: { model: User, as: 'sender'/'receiver' }).
	// Werden genutzt, um den N+1-Query pro Anfrage zu vermeiden.
	sender?: Model<UserAttributes, any>;
	receiver?: Model<UserAttributes, any>;
};

export async function convertToFriendRequest(attribute: FriendRequestAttributes): Promise<FriendRequestData> {
	// Nutzer bevorzugt aus den eager-geladenen Assoziationen lesen (kein N+1);
	// nur ohne include einzeln nachladen.
	return {
		id: attribute.id,
		receivedFrom: attribute.sender
			? UserService.parseBackendUserToFrontend(convertToBackendUser(attribute.sender.dataValues))
			: await UserService.loadFrontEndUserById(attribute.senderId),
		sendTo: attribute.receiver
			? UserService.parseBackendUserToFrontend(convertToBackendUser(attribute.receiver.dataValues))
			: await UserService.loadFrontEndUserById(attribute.receiverId)
	};
}
