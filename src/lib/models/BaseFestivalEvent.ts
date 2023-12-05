import type { GuestInformation } from '$lib/models/GuestInformation';

export interface BaseFestivalEvent {
	id: string;
	name: string;
	description: string;
	bringYourOwnBottle: boolean;
	bringYourOwnFood: boolean;
	guestInformation: GuestInformation[];
}
