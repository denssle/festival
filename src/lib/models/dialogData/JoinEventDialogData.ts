import type { BaseDialogData } from '$lib/models/dialogData/BaseDialogData';
import type { BaseGuestInformation } from '$lib/models/BaseGuestInformation';

export interface JoinEventDialogData extends BaseDialogData, BaseGuestInformation {
	bringYourOwnBottle: boolean;
	bringYourOwnFood: boolean;
}
