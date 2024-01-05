import type { BaseDialogData } from '$lib/models/dialogData/BaseDialogData';
import type { JoinEventData } from '$lib/models/JoinEventData';

export interface JoinEventDialogData extends BaseDialogData, JoinEventData {
	bringYourOwnBottle: boolean;
	bringYourOwnFood: boolean;
}
