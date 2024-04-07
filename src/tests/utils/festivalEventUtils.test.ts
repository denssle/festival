import { test } from '@jest/globals';
import { getTotalNumberOfComingGuests } from '../../lib/utils/festivalEventUtils';

import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
import type { FrontendUser } from '$lib/models/user/FrontendUser';
import type { FrontendGuestInformation } from '$lib/models/guestInformation/FrontendGuestInformation';

function getTestUser(): FrontendUser {
	return {
		id: '',
		nickname: '',
		forename: '',
		lastname: '',
		email: '',
		createdAt: new Date(),
		updatedAt: new Date(),
		image: ''
	};
}

function getTestFestival(): FrontendFestivalEvent {
	const testInfo: FrontendGuestInformation[] = [];
	return {
		id: '',
		name: '',
		description: '',
		bringYourOwnBottle: false,
		bringYourOwnFood: false,
		createdBy: getTestUser(),
		createdAt: null,
		updatedAt: null,
		startDate: null,
		frontendGuestInformation: testInfo,
		location: ''
	};
}

test('0 visitors', () => {
	expect(getTotalNumberOfComingGuests(getTestFestival())).toBe(0);
});

test('1 visitors', () => {
	const festival: FrontendFestivalEvent = getTestFestival();
	festival.frontendGuestInformation = [
		{
			drink: '',
			food: '',
			numberOfOtherGuests: 0,
			user: getTestUser(),
			coming: true,
			comment: ''
		}
	];
	expect(getTotalNumberOfComingGuests(festival)).toBe(1);
});

test('3 visitors', () => {
	const festival: FrontendFestivalEvent = getTestFestival();
	festival.frontendGuestInformation = [
		{
			drink: '',
			food: '',
			numberOfOtherGuests: 2,
			user: getTestUser(),
			coming: true,
			comment: ''
		}
	];
	expect(getTotalNumberOfComingGuests(festival)).toBe(3);
});
