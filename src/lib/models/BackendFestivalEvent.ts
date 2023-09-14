export interface BackendFestivalEvent {
	id: string;
	name: string;
	description: string;
	createdBy: string;
	createdAt: number;
	updatedBy: string | null;
	updatedAt: number | null;
	startDate: number | null;
	visitors: string[];
}
