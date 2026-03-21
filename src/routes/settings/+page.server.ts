import { type Actions } from '@sveltejs/kit';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { UserService } from '$lib/services/user.service';
import { StandardResponse } from '$lib/models/transferData/StandardResponse';

export const actions: Actions = {
	default: async ({ cookies, request }): Promise<StandardResponse> => {
		const user: SessionTokenUser | null = UserService.extractUser(cookies.get('session'));
		const data: FormData = await request.formData();
		const password: string | undefined = data.get('password')?.toString();
		if (user && password) {
			const result: ChangeResult = await UserService.updatePassword(user, password);
			if (result === 'Success') {
				return { success: true, message: 'Password changed' };
			} else {
				return { success: false, message: result };
			}
		}
		return { success: false, message: 'Password change failed' };
	}
};
