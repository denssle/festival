export interface FestivalEventEntity {
	id: string;
	name: string;
	description: string;
	bringYourOwnBottle: boolean;
	bringYourOwnFood: boolean;
	location: string;
	createdBy: string;
	createdAt: number;
	updatedBy: string | null;
	updatedAt: number | null;
	startDate: number | null;
}
