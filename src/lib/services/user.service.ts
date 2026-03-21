import { compareSync, genSaltSync, hashSync } from 'bcrypt-ts';
import type { BackendUser } from '../models/user/BackendUser';
import type { FrontendUser } from '../models/user/FrontendUser';
import type { UserFormData } from '$lib/models/user/UserFormData';
import type { Cookies } from '@sveltejs/kit';
import { convertToBackendUser, UserAttributes } from '$lib/db/attributes/user.attributes';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { Model } from 'sequelize';
import { UserImageAttributes } from '$lib/db/attributes/userImage.attributes';
import { NickPassData } from '$lib/models/transferData/NickPassData';
import { SessionTokenAttributes } from '$lib/db/attributes/sessionToken.attributes';
import { User } from '$lib/db/model/user';
import { UserImage } from '$lib/db/model/userImage';
import { SessionToken } from '$lib/db/model/sessionToken';
import { ChangeResult } from '$lib/models/updates/ChangeResult';

export class UserService {
	static async userExists(extractedUser: SessionTokenUser | null): Promise<boolean> {
		if (extractedUser) {
			return (await this.getByNickname(extractedUser?.nickname)) !== null;
		}
		return false;
	}

	private static async getByNickname(nickname: string): Promise<Model<UserAttributes, any> | null> {
		return await User.findOne({
			where: {
				nickname: nickname
			}
		});
	}

	static async register(nickname: string, password: string): Promise<BackendUser | null> {
		if (!(await this.nickNameInvalid(nickname))) {
			const model = await User.create({
				id: crypto.randomUUID(),
				nickname: nickname,
				password: this.saltPassword(password)
			});
			return convertToBackendUser(model.dataValues);
		}
		return null;
	}

	static saltPassword(password: string): string {
		return hashSync(password, genSaltSync(4));
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

	static async logout(user: SessionTokenUser | null, cookies: Cookies, locals: App.Locals): Promise<void> {
		locals.currentUser = undefined;
		cookies.delete('session', { path: '/' });
		if (user) {
			await SessionToken.destroy({
				where: {
					UserId: user.id,
					token: user.token
				}
			});
		}
	}

	static async validateSessionToken(userString: string | undefined): Promise<boolean> {
		const user: SessionTokenUser | null = this.extractUser(userString);
		if (user) {
			const found: SessionTokenAttributes | undefined = await this.loadToken(user.id);
			if (found && found.token) {
				// TODO Check token age
				return found.token === user.token;
			} else {
				console.error('session validation: no user in db found', user);
			}
		}
		return false;
	}

	private static async loadToken(userId: string): Promise<SessionTokenAttributes | undefined> {
		const model = await SessionToken.findOne({
			where: {
				UserId: userId
			}
		});
		return model?.dataValues;
	}

	static extractUser(sessionToken: string | undefined): SessionTokenUser | null {
		if (sessionToken) {
			try {
				const maybeUser: SessionTokenUser = JSON.parse(sessionToken);
				if (maybeUser) {
					return maybeUser;
				} else {
					console.error('User parsing failed!');
				}
			} catch (e) {
				console.error('error parsing user', e);
			}
			return null;
		}
		return null;
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
		return {
			id: user.id,
			nickname: user.nickname,
			forename: user.forename,
			lastname: user.lastname,
			email: user.email,
			updatedAt: user.updatedAt,
			createdAt: user.createdAt
		};
	}

	static async readFormDataFrontEndUser(data: Promise<FormData>): Promise<UserFormData> {
		const values: FormData = await data;
		return {
			email: String(values.get('email')),
			nickname: String(values.get('nickname')),
			forename: String(values.get('forename')),
			lastname: String(values.get('lastname'))
		};
	}

	static async readNickPass(data: Promise<FormData>): Promise<NickPassData | undefined> {
		const values: FormData = await data;
		const nickname = String(values.get('nickname'));
		const password = String(values.get('password'));
		if (nickname && password) {
			return {
				nickname: nickname,
				password: password
			};
		}
	}

	static async createSessionCookie(
		cookies: Cookies,
		locals: App.Locals,
		user: BackendUser | SessionTokenUser
	): Promise<void> {
		const token: string = crypto.randomUUID();
		await SessionToken.upsert({
			UserId: user.id,
			token: token
		});
		cookies.set(
			'session',
			JSON.stringify({
				id: user.id,
				token: token,
				nickname: user.nickname
			} as SessionTokenUser),
			{
				path: '/',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 30
			}
		);
		locals.currentUser = {
			isAuthenticated: true,
			id: user.id,
			email: user.email,
			nickname: user.nickname
		};
	}

	static async updateUser(oldUser: SessionTokenUser, formData: UserFormData): Promise<ChangeResult> {
		const model: Model<UserAttributes, any> | null = await User.findByPk(oldUser.id);
		if (model) {
			if (this.isChangeAllowed(oldUser.id, model.dataValues)) {
				model.set({
					email: formData.email,
					lastname: formData.lastname,
					forename: formData.forename
				});
				await model.save();
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

	static async updatePassword(oldUser: SessionTokenUser, password: string): Promise<ChangeResult> {
		const model: Model<UserAttributes, any> | null = await User.findByPk(oldUser.id);
		if (model) {
			if (this.isChangeAllowed(oldUser.id, model.dataValues)) {
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
		const model: Model<UserImageAttributes, any> | null = await UserImage.findOne({ where: { UserId: userId } });
		if (model) {
			await model.update({ image: Buffer.from(image) });
		} else {
			await UserImage.create({ id: crypto.randomUUID(), UserId: userId, image: Buffer.from(image) });
		}
		return image;
	}

	static async getUserImage(userId: string): Promise<string | null> {
		const model: Model<UserImageAttributes, any> | null = await UserImage.findOne({ where: { UserId: userId } });
		return model ? model.dataValues.image.toString() : null;
	}
}
