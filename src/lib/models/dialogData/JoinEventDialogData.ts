import type { BasicDialogData } from '$lib/models/dialogData/BasicDialogData';

export interface JoinEventDialogData extends BasicDialogData{
	bringYourOwnBottle: boolean;
	bringYourOwnFood: boolean;
	food: string;
	drink: string;
	numberOfOtherGuests: number;
}
