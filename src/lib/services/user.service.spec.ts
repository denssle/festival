import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { UserService } from '$lib/services/user.service';
import { sequelize } from '$lib/db/sequelize';
import { SessionToken } from '$lib/db/model/sessionToken';
import { User } from '$lib/db/model/user';
import { createUser, resetDatabase } from '$lib/db/test-fixtures';
import { SESSION_MAX_AGE_MS } from '$lib/constants';
import type { BackendUser } from '$lib/models/user/BackendUser';
import type { UserFormData } from '$lib/models/user/UserFormData';

/**
 * Absicherung von `updateUser` gegen Nicknames, die den Account unbrauchbar machen.
 *
 * Läuft gegen die In-Memory-SQLite (siehe sequelize.ts), braucht also keine echte DB.
 * Den komplett leeren Nickname fängt bereits `nickNameInvalid` in der Update-Action ab –
 * ein Name aus reinen Leerzeichen kommt dort jedoch durch, weil er weder leer noch
 * vergeben ist. Der Login läuft über den Nickname, ein solcher Wert würde den Zugang
 * also verlieren.
 */
describe('UserService.updateUser: Nickname-Schutz', () => {
	let user: BackendUser;

	beforeAll(async () => {
		await startDB();
		const registered = await UserService.register(`NickGuard_${Date.now()}`, 'SafePassword123!');
		if (!registered) {
			throw new Error('Testnutzer konnte nicht angelegt werden');
		}
		user = registered;
	});

	function formDataWith(nickname: string): UserFormData {
		return { nickname, email: '', forename: '', lastname: '' };
	}

	it('lehnt einen Nickname aus reinen Leerzeichen ab', async () => {
		expect(await UserService.updateUser(user.id, formDataWith('   '))).toBe('Data Missing');
	});

	it('lehnt einen leeren Nickname ab', async () => {
		expect(await UserService.updateUser(user.id, formDataWith(''))).toBe('Data Missing');
	});

	it('lässt den gespeicherten Nickname dabei unverändert', async () => {
		await UserService.updateUser(user.id, formDataWith('  '));

		const unchanged = await UserService.loadFrontEndUserById(user.id);
		expect(unchanged?.nickname).toBe(user.nickname);
	});

	it('akzeptiert einen gültigen Nickname weiterhin', async () => {
		const newNickname = `NickGuardNeu_${Date.now()}`;

		expect(await UserService.updateUser(user.id, formDataWith(newNickname))).toBe('Success');

		const updated = await UserService.loadFrontEndUserById(user.id);
		expect(updated?.nickname).toBe(newNickname);
	});
});

/**
 * Sitzungsprüfung im Auth-Hook: unbekannte und abgelaufene Tokens ergeben keinen Nutzer,
 * abgelaufene werden dabei gleich gelöscht.
 */
describe('UserService.getCurrentUserBySessionToken', () => {
	let userId: string;

	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		await resetDatabase();
		userId = await createUser('sitzung');
		await SessionToken.create({ UserId: userId, token: 'gueltig' });
	});

	it('löst ein gültiges Token in den Nutzer auf', async () => {
		expect(await UserService.getCurrentUserBySessionToken('gueltig')).toMatchObject({
			isAuthenticated: true,
			id: userId,
			nickname: 'sitzung'
		});
	});

	it('ohne oder mit unbekanntem Token gibt es keinen Nutzer', async () => {
		expect(await UserService.getCurrentUserBySessionToken(undefined)).toBeNull();
		expect(await UserService.getCurrentUserBySessionToken('')).toBeNull();
		expect(await UserService.getCurrentUserBySessionToken('erfunden')).toBeNull();
	});

	it('ein abgelaufenes Token gilt nicht mehr und wird gelöscht', async () => {
		const expired = new Date(Date.now() - SESSION_MAX_AGE_MS - 60_000);
		// updatedAt pflegt Sequelize selbst – deshalb direkt per SQL zurückdatieren.
		await sequelize.query('UPDATE sessionTokens SET updatedAt = ? WHERE token = ?', {
			replacements: [expired.toISOString(), 'gueltig']
		});

		expect(await UserService.getCurrentUserBySessionToken('gueltig')).toBeNull();
		expect(await SessionToken.count()).toBe(0);
	});
});

describe('UserService: vergebene Nicknames und Adressen', () => {
	let userId: string;

	beforeAll(async () => {
		await startDB();
	});

	beforeEach(async () => {
		await resetDatabase();
		userId = await createUser('vergeben');
		await User.update({ email: 'vergeben@example.com' }, { where: { id: userId } });
	});

	it('ein leerer oder vergebener Nickname ist ungültig, ein freier nicht', async () => {
		expect(await UserService.nickNameInvalid('')).toBe(true);
		expect(await UserService.nickNameInvalid('vergeben')).toBe(true);
		expect(await UserService.nickNameInvalid('frei')).toBe(false);
	});

	it('die eigene Adresse ist kein Konflikt, die eines anderen schon', async () => {
		const other = await createUser('andere');
		expect(await UserService.emailTakenByOtherUser('vergeben@example.com', userId)).toBe(false);
		expect(await UserService.emailTakenByOtherUser('vergeben@example.com', other)).toBe(true);
		expect(await UserService.emailTakenByOtherUser('', other)).toBe(false);
	});
});
