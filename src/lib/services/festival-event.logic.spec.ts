import { describe, it, expect } from 'vitest';
import { isChangeAllowed } from './festival-event.logic';

describe('festival-event.logic', () => {
    it('should return true if userId matches ownerId', () => {
        expect(isChangeAllowed('user123', 'user123')).toBe(true);
    });

    it('should return false if userId does not match ownerId', () => {
        expect(isChangeAllowed('user123', 'otherUser')).toBe(false);
    });
});
