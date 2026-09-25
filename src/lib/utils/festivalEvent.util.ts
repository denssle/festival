import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import type { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';
import type { Answer } from '$lib/models/Answer';

/** Alle Gäste eines Festivals mit der gegebenen Antwort. */
export function getGuestsWithAnswer(festival: FrontendFestivalEvent, answer: Answer): FrontendGuestInformation[] {
	return (festival.frontendGuestInformation ?? []).filter((value) => value.answer === answer);
}

/**
 * Erwartete Personenzahl: alle Zusagen samt mitgebrachter Gäste. Ein „Vielleicht“ zählt
 * bewusst nicht mit (2026-09-25) – geplant wird mit denen, die sicher kommen.
 */
export function getTotalNumberOfComingGuests(festival: FrontendFestivalEvent): number {
	const coming = getGuestsWithAnswer(festival, 'yes');
	let result: number = coming.length;
	for (const information of coming) {
		result += information.numberOfOtherGuests;
	}
	return result;
}
