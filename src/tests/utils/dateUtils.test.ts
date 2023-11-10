import { expect, test } from '@jest/globals';
import { createDateFromStrings } from '../../lib/utils/dateUtils';

test('test createDateFromStrings', () => {
	expect(createDateFromStrings('2023-11-05', '16:00')).toBe(null);
});

test('test createDateFromStrings', () => {
	expect(createDateFromStrings('2023-11-05', '')).toBe(1701730800000);
});
