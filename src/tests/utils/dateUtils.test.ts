import { expect, test } from '@jest/globals';
import { createDateTimeFromStrings, dateToString, dateTimeToDate } from '../../lib/utils/dateUtils';

test('test createDateFromStrings empty', () => {
	expect(createDateTimeFromStrings('', '')).toBe(null);
});

test('test createDateFromStrings with just a date', () => {
	expect(createDateTimeFromStrings('2023-11-05', '')).toBe(1701730800000);
});

test('test createDateFromStrings with garbage as date', () => {
	expect(createDateTimeFromStrings('garbage', '16:00')).toBe(null);
});

test('test createDateFromStrings with garbage - as date', () => {
	expect(createDateTimeFromStrings('garbage', '16:00')).toBe(null);
});

test('test createDateFromStrings with garbage as time', () => {
	expect(createDateTimeFromStrings('2023-11-05', 'ga-rb-ag-e')).toBe(null);
});

test('test createDateFromStrings with garbage and . as time', () => {
	expect(createDateTimeFromStrings('2023-11-05', 'ga.rbage')).toBe(null);
});

test('test createDateFromStrings with date and time', () => {
	expect(createDateTimeFromStrings('2023-11-05', '16:00')).toBe(1701788400000);
});

test('test numberToDate', () => {
	const date: Date | null = dateTimeToDate(1701730800000);
	expect(date?.getFullYear()).toBe(2023);
	expect(date?.getMonth()).toBe(11);
	expect(date?.getDate()).toBe(5);
});

test('test numberToDate with null', () => {
	const date: Date | null = dateTimeToDate(null);
	expect(date).toBe(null);
});

test('test numberToDate with undefined', () => {
	const date: Date | null = dateTimeToDate(undefined);
	expect(date).toBe(null);
});

test('test dateToDateString', () => {
	const date: string = dateToString(dateTimeToDate(1701730800000));
	expect(date).toBe('2023-12-05');
});

test('test dateToDateString with null', () => {
	const date: string = dateToString(null);
	expect(date).toBe('');
});
