import { beforeAll, describe, expect, it } from 'vitest';
import { startDB } from '$lib/db/db';
import { UserService } from '$lib/services/user.service';
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
