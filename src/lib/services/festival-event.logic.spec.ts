import { describe, it, expect } from 'vitest';
import { canSeeFestival, isChangeAllowed } from './festival-event.logic';

describe('festival-event.logic', () => {
	it('should return true if userId matches ownerId', () => {
		expect(isChangeAllowed('user123', 'user123')).toBe(true);
	});

	it('should return false if userId does not match ownerId', () => {
		expect(isChangeAllowed('user123', 'otherUser')).toBe(false);
	});
});

describe('canSeeFestival', () => {
	it('lässt den Ersteller sein Festival sehen', () => {
		expect(canSeeFestival('owner', 'owner', false, false)).toBe(true);
	});

	it('lässt Freunde des Erstellers das Festival sehen', () => {
		expect(canSeeFestival('friend', 'owner', true, false)).toBe(true);
	});

	it('lässt Gäste, die schon geantwortet haben, das Festival weiter sehen', () => {
		expect(canSeeFestival('ex-friend', 'owner', false, true)).toBe(true);
	});

	it('verbirgt das Festival vor allen anderen', () => {
		expect(canSeeFestival('stranger', 'owner', false, false)).toBe(false);
	});
});
