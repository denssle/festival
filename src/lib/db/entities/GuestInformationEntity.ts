export interface GuestInformationEntity {
	id: string;
	festival_event_id: string;
	food: string;
	drink: string;
	numberOfOtherGuests: number;
	coming: boolean;
	comment: string;
}