import type { BaseFestivalEvent } from '$lib/models/BaseFestivalEvent';

export interface BackendFestivalEvent extends BaseFestivalEvent {
	createdBy: string;
	createdAt: number;
	updatedBy: string | null;
	updatedAt: number | null;
	startDate: number | null;
}
