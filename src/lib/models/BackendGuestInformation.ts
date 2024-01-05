import type { JoinEventData } from '$lib/models/JoinEventData';

export interface BackendGuestInformation extends JoinEventData {
	userId: string;
}
