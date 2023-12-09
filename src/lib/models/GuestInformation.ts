import type { JoinEventData } from '$lib/models/JoinEventData';

export interface GuestInformation extends JoinEventData {
	userId: string;
}
