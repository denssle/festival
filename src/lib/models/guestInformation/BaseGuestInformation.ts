import type { Answer } from '$lib/models/Answer';

export interface BaseGuestInformation {
	food: string;
	drink: string;
	numberOfOtherGuests: number;
	answer: Answer;
	comment: string;
}
