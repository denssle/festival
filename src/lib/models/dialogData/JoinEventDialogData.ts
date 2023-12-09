import type { BasicDialogData } from '$lib/models/dialogData/BasicDialogData';
import type { JoinEventData } from '$lib/models/JoinEventData';

export interface JoinEventDialogData extends BasicDialogData, JoinEventData {
	bringYourOwnBottle: boolean;
	bringYourOwnFood: boolean;
}
