/**
 * Öffentliche User-Basisdaten OHNE E-Mail.
 *
 * `FrontendUser` erbt hiervon und wird an beliebige Clients serialisiert
 * (Updates, Kommentar-Autoren, Freundeslisten) – private Felder wie die
 * E-Mail gehören daher in `BackendUser` (serverseitig) bzw. werden nur
 * fürs eigene Profil separat ausgeliefert.
 */
export interface BaseUser {
	id: string;
	nickname: string;
	forename: string;
	lastname: string;
	createdAt: Date;
	updatedAt: Date;
}
