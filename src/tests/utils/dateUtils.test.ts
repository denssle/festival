import { expect, test } from '@jest/globals';
import { dateToString, getUTCFromString } from '../../lib/utils/dateUtils';

const fiveOfDecember: string = '2023-12-05';

test('test getUTCFromString empty', () => {
	expect(getUTCFromString('', '')).toBe(null);
});

test('test getUTCFromString with just a date', () => {
	expect(getUTCFromString(fiveOfDecember, '')).toBe(1701777600000);
});

test('test getUTCFromString with garbage as date', () => {
	expect(getUTCFromString('garbage', '16:00')).toBe(null);
});

test('test getUTCFromString with garbage - as date', () => {
	expect(getUTCFromString('garbage', '16:00')).toBe(null);
});

test('test getUTCFromString with garbage as time', () => {
	expect(getUTCFromString(fiveOfDecember, 'ga-rb-ag-e')).toBe(null);
});

test('test getUTCFromString with garbage and . as time', () => {
	expect(getUTCFromString(fiveOfDecember, 'ga.rbage')).toBe(null);
});

test('test getUTCFromString with garbage and : as time', () => {
	expect(getUTCFromString(fiveOfDecember, 'ga:rbage')).toBe(null);
});

test('test getUTCFromString with date and time', () => {
	expect(getUTCFromString(fiveOfDecember, '16:00')).toBe(1701792000000);
});

test('test dateToString with null', () => {
	expect(dateToString(null)).toBe('');
});
