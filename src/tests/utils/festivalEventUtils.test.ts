import { test } from '@jest/globals';
import { getTotalNumberOfGuests } from '../../lib/utils/festivalEventUtils';

import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
import type { FrontendUser } from '$lib/models/FrontendUser';
import type { FrontendGuestInformation } from '$lib/models/FrontendGuestInformation';

function getTestUser(): FrontendUser {
	return {
		id: '',
		nickname: '',
		forename: '',
		lastname: '',
		email: ''
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
		updatedBy: null,
		updatedAt: null,
		startDate: null,
		frontendGuestInformation: testInfo,
		location: ''
	};
}

test('0 visitors', () => {
	expect(getTotalNumberOfGuests(getTestFestival())).toBe(0);
});

test('1 visitors', () => {
	const festival: FrontendFestivalEvent = getTestFestival();
	festival.frontendGuestInformation = [
		{
			userId: '',
			drink: '',
			food: '',
			numberOfOtherGuests: 0,
			user: getTestUser(),
			coming: true,
			comment: ''
		}
	];
	expect(getTotalNumberOfGuests(festival)).toBe(1);
});

test('3 visitors', () => {
	const festival: FrontendFestivalEvent = getTestFestival();
	festival.frontendGuestInformation = [
		{
			userId: '',
			drink: '',
			food: '',
			numberOfOtherGuests: 2,
			user: getTestUser(),
			coming: false,
			comment: ''
		}
	];
	expect(getTotalNumberOfGuests(festival)).toBe(3);
});
