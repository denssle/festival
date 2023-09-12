export interface BackendFestivalEvent {
	id: string;
	name: string;
	description: string;
	createdBy: string;
	createdAt: number;
	updatedBy: string | undefined;
	updatedAt: number | undefined;
	startDate?: number;
}
