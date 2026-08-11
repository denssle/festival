import { compareSync, genSaltSync, hashSync } from 'bcrypt-ts';
import type { BackendUser } from '../models/user/BackendUser';
import type { FrontendUser } from '../models/user/FrontendUser';
import type { UserFormData } from '$lib/models/user/UserFormData';
import type { Cookies } from '@sveltejs/kit';
import { convertToBackendUser, UserAttributes, UserCreationAttributes } from '$lib/db/attributes/user.attributes';
import { CurrentUser } from '$lib/models/user/CurrentUser';
import { Model, UniqueConstraintError } from 'sequelize';
import { UserImageAttributes, UserImageCreationAttributes } from '$lib/db/attributes/userImage.attributes';
import { NickPassData } from '$lib/models/transferData/NickPassData';
import { SessionTokenAttributes } from '$lib/db/attributes/sessionToken.attributes';
import { User } from '$lib/db/model/user';
import { UserImage } from '$lib/db/model/userImage';
import { SessionToken } from '$lib/db/model/sessionToken';
import { ChangeResult } from '$lib/models/updates/ChangeResult';
import { isSessionTokenExpired, readTextField } from '$lib/services/user.logic';
import { SESSION_MAX_AGE_MS, SESSION_MAX_AGE_SECONDS } from '$lib/constants';
import { dev } from '$app/environment';

export class UserService {
	private static async getByNickname(nickname: string): Promise<Model<UserAttributes, UserCreationAttributes> | null> {
		return await User.findOne({
			where: {
				nickname: nickname
			}
		});
	}

	private static async getByEmail(email: string): Promise<Model<UserAttributes, UserCreationAttributes> | null> {
		return await User.findOne({
			where: {
				email: email
			}
		});
	}

	static async emailInvalid(email: string): Promise<boolean> {
		if (!email || email.length === 0) return false; // leere E-Mail ist erlaubt (optional)
		return Boolean(await this.getByEmail(email));
	}

	/**
	 * Prüft, ob die E-Mail bereits von einem ANDEREN Nutzer belegt ist.
	 * Anders als `emailInvalid` erlaubt dies dem Nutzer, seine eigene, unveränderte
	 * E-Mail beim Profil-Update erneut zu speichern (kein Self-Match als Konflikt).
	 * Eine leere E-Mail ist optional und daher nie ein Konflikt.
	 */
	static async emailTakenByOtherUser(email: string, userId: string): Promise<boolean> {
		if (!email || email.length === 0) return false;
		const existing: Model<UserAttributes, UserCreationAttributes> | null = await this.getByEmail(email);
		return existing !== null && existing.dataValues.id !== userId;
	}

	static async register(nickname: string, password: string, email?: string): Promise<BackendUser | null> {
		if (!(await this.nickNameInvalid(nickname))) {
			if (email && (await this.emailInvalid(email))) {
				return null;
			}
			try {
				const model = await User.create({
					id: crypto.randomUUID(),
					nickname: nickname,
					password: this.saltPassword(password),
					...(email ? { email } : {})
				});
				return convertToBackendUser(model.dataValues);
			} catch (error) {
				// Paralleler Request hat den Nickname zuerst registriert – der Unique-Index greift
				if (error instanceof UniqueConstraintError) {
					return null;
				}
				throw error;
			}
		}
		return null;
	}

	static saltPassword(password: string): string {
		return hashSync(password, genSaltSync(10));
	}

	static async loginWithCredentials(nickname: string, password: string): Promise<BackendUser | null> {
		const user: BackendUser | null = await this.loadUserByNickname(nickname);
		if (user && user.password) {
			if (compareSync(password, user.password)) {
				return user;
			}
		}
		return null;
	}

	static async logout(cookies: Cookies, locals: App.Locals): Promise<void> {
		const token: string | undefined = cookies.get('session');
		locals.currentUser = undefined;
		cookies.delete('session', { path: '/' });
		if (token) {
			await SessionToken.destroy({
				where: {
					token: token
				}
			});
		}
	}

	/**
	 * Löst ein opakes Session-Token (Cookie-Wert) in den zugehörigen Nutzer auf.
	 *
	 * Der Cookie enthält NUR den Zufalls-Token – Identität (id/nickname/email) kommt
	 * ausschließlich aus der DB und ist damit nicht client-manipulierbar. Abgelaufene
	 * Tokens werden dabei direkt aus der DB entfernt.
	 *
	 * @returns CurrentUser bei gültiger Session, sonst null
	 */
	static async getCurrentUserBySessionToken(token: string | undefined): Promise<CurrentUser | null> {
		if (!token) {
			return null;
		}
		const model = await SessionToken.findOne({ where: { token: token } });
		if (!model) {
			return null;
		}
		const session: SessionTokenAttributes = model.dataValues;
		if (isSessionTokenExpired(session.updatedAt, SESSION_MAX_AGE_MS)) {
			console.info('session validation: token expired', session.UserId);
			await model.destroy();
			return null;
		}
		const user: BackendUser | null = await this.loadUserById(session.UserId);
		if (!user) {
			console.error('session validation: no user in db found', session.UserId);
			return null;
		}
		return {
			isAuthenticated: true,
			id: user.id,
			nickname: user.nickname,
			email: user.email ?? ''
		};
	}

	static async nickNameInvalid(nickname: string): Promise<boolean> {
		return !nickname || nickname.length === 0 || Boolean(await this.getByNickname(nickname));
	}

	private static async loadUserByNickname(nickname: string): Promise<BackendUser | null> {
		const model = await this.getByNickname(nickname);
		if (model) {
			return convertToBackendUser(model.dataValues);
		}
		return null;
	}

	private static async loadUserById(userId: string): Promise<BackendUser | null> {
		const value = await User.findByPk(userId);
		if (value) {
			return convertToBackendUser(value.dataValues);
		}
		return null;
	}

	static async loadFrontEndUserById(id: string | null): Promise<FrontendUser | undefined> {
		if (id) {
			const byId: BackendUser | null = await this.loadUserById(id);
			if (byId) {
				return this.parseBackendUserToFrontend(byId);
			}
		}
	}

	static parseBackendUserToFrontend(user: BackendUser): FrontendUser {
		// Bewusst KEINE email: FrontendUser ist das öffentliche Modell und wird
		// an beliebige Clients serialisiert (Updates, Kommentare, Freundeslisten).
		return {
			id: user.id,
			nickname: user.nickname,
			forename: user.forename,
			lastname: user.lastname,
			updatedAt: user.updatedAt,
			createdAt: user.createdAt
		};
	}

	/**
	 * Lädt mehrere Nutzer mit EINEM Query (WHERE id IN …) und mappt sie aufs
	 * öffentliche FrontendUser-Modell. Vermeidet N+1-Einzel-Loads in Listen
	 * (z. B. Freundesliste).
	 */
	static async loadFrontendUsersByIds(ids: string[]): Promise<FrontendUser[]> {
		if (ids.length === 0) {
			return [];
		}
		const models = await User.findAll({ where: { id: ids } });
		return models.map((model) => this.parseBackendUserToFrontend(convertToBackendUser(model.dataValues)));
	}

	/**
	 * Liefert die E-Mail eines Nutzers. Nur fürs EIGENE Profil an den Client
	 * ausliefern – `FrontendUser` enthält bewusst keine E-Mail.
	 */
	static async getEmailById(userId: string): Promise<string> {
		const user: BackendUser | null = await this.loadUserById(userId);
		return user?.email ?? '';
	}

	/**
	 * Liest die Profilfelder aus dem Formular. Fehlende Felder ergeben einen leeren
	 * String – ein früheres `String(values.get(...))` machte daraus den Text "null",
	 * der als E-Mail bzw. Name in der Datenbank landete (und in `emailTakenByOtherUser`
	 * dazu führte, dass zwei Nutzer ohne E-Mail sich gegenseitig blockierten).
	 */
	static async readFormDataFrontEndUser(data: Promise<FormData>): Promise<UserFormData> {
		const values: FormData = await data;
		return {
			email: readTextField(values, 'email'),
			nickname: readTextField(values, 'nickname'),
			forename: readTextField(values, 'forename'),
			lastname: readTextField(values, 'lastname')
		};
	}

	static async readNickPass(data: Promise<FormData>): Promise<NickPassData | undefined> {
		const values: FormData = await data;
		const nickname = values.get('nickname');
		const password = values.get('password');
		if (typeof nickname === 'string' && nickname.length > 0 && typeof password === 'string' && password.length > 0) {
			return {
				nickname: nickname,
				password: password
			};
		}
	}

	/**
	 * Erstellt eine neue Session: generiert IMMER einen frischen Zufalls-Token,
	 * persistiert ihn (ersetzt einen evtl. vorhandenen Token des Nutzers) und setzt
	 * den Cookie. Wird bei Login, Registrierung und Passwortänderung (Rotation)
	 * aufgerufen – NICHT mehr pro Request: Der Auth-Hook liest die Session nur noch.
	 */
	static async createSession(cookies: Cookies, locals: App.Locals, user: BackendUser | CurrentUser): Promise<void> {
		const token: string = crypto.randomUUID();

		await SessionToken.upsert({
			UserId: user.id,
			token: token
		});

		// Der Cookie enthält NUR den opaken Token – niemals Identitätsdaten,
		// die der Client manipulieren könnte.
		cookies.set('session', token, {
			path: '/',
			httpOnly: true, // kein Zugriff via document.cookie (XSS-Schutz)
			sameSite: 'strict', // Cookie nur bei Same-Site-Requests (CSRF-Schutz)
			// Secure an den Build-Modus koppeln statt an SvelteKits Auto-Erkennung:
			// lokal/E2E läuft über http://localhost (Secure würde das Cookie verwerfen),
			// in Prod steht die Node-App hinter einem HTTPS-Reverse-Proxy, der intern
			// per HTTP spricht – dort würde die Auto-Erkennung Secure fälschlich weglassen.
			secure: !dev,
			maxAge: SESSION_MAX_AGE_SECONDS
		});
		locals.currentUser = {
			isAuthenticated: true,
			id: user.id,
			email: user.email ?? '',
			nickname: user.nickname
		};
	}

	static async updateUser(userId: string, formData: UserFormData): Promise<ChangeResult> {
		const model: Model<UserAttributes, UserCreationAttributes> | null = await User.findByPk(userId);
		if (model) {
			if (this.isChangeAllowed(userId, model.dataValues)) {
				model.set({
					email: formData.email,
					lastname: formData.lastname,
					forename: formData.forename,
					nickname: formData.nickname
				});
				try {
					await model.save();
				} catch (error) {
					// Nickname-Kollision (Unique-Index) – z. B. paralleler Request oder
					// eine Race mit der vorgelagerten nickNameInvalid-Prüfung
					if (error instanceof UniqueConstraintError) {
						return 'Failure';
					}
					throw error;
				}
				return 'Success';
			} else {
				return 'Not authorized';
			}
		}
		return 'Data Missing';
	}

	private static isChangeAllowed(userId: string, dataValues: UserAttributes): boolean {
		return dataValues.id === userId;
	}

	static async updatePassword(userId: string, password: string): Promise<ChangeResult> {
		const model: Model<UserAttributes, UserCreationAttributes> | null = await User.findByPk(userId);
		if (model) {
			if (this.isChangeAllowed(userId, model.dataValues)) {
				model.set({
					password: this.saltPassword(password)
				});
				await model.save();
				return 'Success';
			} else {
				return 'Not authorized';
			}
		}
		return 'Data Missing';
	}

	static async saveUserImage(userId: string, image: string): Promise<string> {
		const model: Model<UserImageAttributes, UserImageCreationAttributes> | null = await UserImage.findOne({
			where: { UserId: userId }
		});
		if (model) {
			await model.update({ image: Buffer.from(image) });
		} else {
			await UserImage.create({ id: crypto.randomUUID(), UserId: userId, image: Buffer.from(image) });
		}
		return image;
	}

	static async getUserImage(userId: string): Promise<string | null> {
		const model: Model<UserImageAttributes, UserImageCreationAttributes> | null = await UserImage.findOne({
			where: { UserId: userId }
		});
		return model ? model.dataValues.image.toString() : null;
	}
}
