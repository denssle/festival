import { describe, it, expect } from 'vitest';
import { getGuestsWithAnswer, getTotalNumberOfComingGuests } from './festivalEvent.util';
import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import type { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';
import type { Answer } from '$lib/models/Answer';

function guest(answer: Answer, numberOfOtherGuests = 0): FrontendGuestInformation {
	return { answer, numberOfOtherGuests, food: '', drink: '', comment: '', user: undefined };
}

function festival(guests: FrontendGuestInformation[]): FrontendFestivalEvent {
	return { frontendGuestInformation: guests } as FrontendFestivalEvent;
}

describe('getTotalNumberOfComingGuests', () => {
	it('sollte Zusagen samt mitgebrachter Gäste zählen', () => {
		expect(getTotalNumberOfComingGuests(festival([guest('yes', 2), guest('yes')]))).toBe(4);
	});

	// Geplant wird mit denen, die sicher kommen.
	it('sollte Vielleicht und Absagen nicht mitzählen', () => {
		expect(getTotalNumberOfComingGuests(festival([guest('yes'), guest('maybe', 3), guest('no', 1)]))).toBe(1);
	});

	it('sollte ohne Gästeliste 0 liefern', () => {
		expect(getTotalNumberOfComingGuests({} as FrontendFestivalEvent)).toBe(0);
	});
});

describe('getGuestsWithAnswer', () => {
	it('sollte nur Gäste mit der gegebenen Antwort liefern', () => {
		const maybe = guest('maybe');
		expect(getGuestsWithAnswer(festival([guest('yes'), maybe, guest('no')]), 'maybe')).toEqual([maybe]);
	});
});
