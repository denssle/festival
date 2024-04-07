import { expect, test } from '@jest/globals';
import {
	convertUTCToLocalDate, dateToDDMMYYYY, dateToHHMM,
	dateToHHMMSS,
	dateToString, formateDateTime,
	getUTCFromString,
	getUTCNow
} from '../../lib/utils/dateUtils';

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

test('test convertUTCToDate', () => {
	const date: Date | null = convertUTCToLocalDate(1701777600000);
	expect(date?.getFullYear()).toBe(2023);
	expect(date?.getMonth()).toBe(11);
	expect(date?.getDate()).toBe(5);
});

test('test convertUTCToDate with null', () => {
	expect(convertUTCToLocalDate(null)).toBe(null);
});

test('test convertUTCToDate with undefined', () => {
	expect(convertUTCToLocalDate(undefined)).toBe(null);
});

test('test dateToString', () => {
	expect(dateToString(convertUTCToLocalDate(1701777600000))).toBe(fiveOfDecember);
});

test('test dateToString with null', () => {
	expect(dateToString(null)).toBe('');
});

test('test dateToTimeString', () => {
	expect(dateToHHMM(convertUTCToLocalDate(1701777600000))).toBe('13:00');
});

test('test formateDateTime', () => {
	expect(formateDateTime(convertUTCToLocalDate(1701777600000))).toBe('05.12.2023 13:00:00');
});

test('test formateDate', () => {
	expect(dateToDDMMYYYY(convertUTCToLocalDate(1701777600000))).toBe('05.12.2023');
});

test('test formateTime', () => {
	expect(dateToHHMMSS(convertUTCToLocalDate(1701777600000))).toBe('13:00:00');
});

test('test getUTCNow', () => {
	const now: Date = new Date();
	const nowTime: number = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		now.getHours(),
		now.getMinutes()
	).getTime();
	const utcTime: number = getUTCNow();
	expect(convertUTCToLocalDate(utcTime)?.getTime()).toBe(nowTime);
});
