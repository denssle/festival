import { expect, test } from '@jest/globals';
import { createDateFromStrings } from '../../lib/utils/dateUtils';

test('test createDateFromStrings empty', () => {
	expect(createDateFromStrings('', '')).toBe(null);
});

test('test createDateFromStrings with just a date', () => {
	expect(createDateFromStrings('2023-11-05', '')).toBe(1701730800000);
});

test('test createDateFromStrings with garbage as date', () => {
	expect(createDateFromStrings('garbage', '16:00')).toBe(null);
});

test('test createDateFromStrings with garbage as time', () => {
	expect(createDateFromStrings('2023-11-05', 'garbage')).toBe(null);
});

test('test createDateFromStrings with date and time', () => {
	expect(createDateFromStrings('2023-11-05', '16:00')).toBe(1701788400000);
});
