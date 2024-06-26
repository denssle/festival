import { expect, test } from '@jest/globals';
import { dateToString, getDateFromString } from '../../lib/utils/date.util';

const fiveOfDecember: string = '2023-12-05';

test('test getDateFromString empty', () => {
	expect(getDateFromString('', '')).toBe(null);
});

test('test getDateFromString with garbage as date', () => {
	expect(getDateFromString('garbage', '16:00')).toBe(null);
});

test('test getDateFromString with garbage - as date', () => {
	expect(getDateFromString('garbage', '16:00')).toBe(null);
});

test('test getDateFromString with garbage as time', () => {
	expect(getDateFromString(fiveOfDecember, 'ga-rb-ag-e')).toBe(null);
});

test('test getDateFromString with garbage and . as time', () => {
	expect(getDateFromString(fiveOfDecember, 'ga.rbage')).toBe(null);
});

test('test getDateFromString with garbage and : as time', () => {
	expect(getDateFromString(fiveOfDecember, 'ga:rbage')).toBe(null);
});

/*
test('test getDateFromString with just a date', () => {
	expect(getDateFromString(fiveOfDecember, '')).toBe(1701774000000);
});

test('test getDateFromString with date and time', () => {
	expect(getDateFromString(fiveOfDecember, '16:00')).toBe(1701788400000);
});
 */

test('test dateToString with null', () => {
	expect(dateToString(null)).toBe('');
});
