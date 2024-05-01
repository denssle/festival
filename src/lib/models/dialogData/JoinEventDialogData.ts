import type { BaseDialogData } from '$lib/models/dialogData/BaseDialogData';
import type { BaseGuestInformation } from '$lib/models/guestInformation/BaseGuestInformation';

export interface JoinEventDialogData extends BaseDialogData, BaseGuestInformation {
	bringYourOwnBottle: boolean;
	bringYourOwnFood: boolean;
}
