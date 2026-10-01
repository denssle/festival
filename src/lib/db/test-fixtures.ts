import { sequelize } from '$lib/db/sequelize';
import { User } from '$lib/db/model/user';
import { FestivalEvent } from '$lib/db/model/festivalEvent';

/**
 * Gemeinsame Helfer für Integrationstests gegen die In-Memory-SQLite (siehe sequelize.ts).
 * Nur aus `*.spec.ts` importieren.
 */

/** Leert alle Tabellen – für `beforeEach`, damit jeder Test bei null anfängt. */
export async function resetDatabase(): Promise<void> {
	for (const model of Object.values(sequelize.models)) {
		await model.destroy({ where: {}, truncate: true, cascade: true });
	}
}

/** Legt einen Nutzer an; das Passwort ist ein Platzhalter, kein gültiger Hash. */
export async function createUser(nickname: string): Promise<string> {
	const id = crypto.randomUUID();
	await User.create({ id, nickname, password: 'hash' });
	return id;
}

export async function createFestival(ownerId: string, name = 'Festival'): Promise<string> {
	const id = crypto.randomUUID();
	await FestivalEvent.create({ id, name, UserId: ownerId });
	return id;
}
