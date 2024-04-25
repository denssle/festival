import { type Actions } from '@sveltejs/kit';
import { SessionTokenUser } from '$lib/models/user/SessionTokenUser';
import { extractUser, updatePassword } from '$lib/services/user-service';
import { StandardResponse } from '$lib/models/StandardResponse';


export const actions: Actions = {
	default: async ({ cookies, request }): Promise<StandardResponse> => {
		const user: SessionTokenUser | null = extractUser(cookies.get('session'));
		const data: FormData = await request.formData();
		const password: string | undefined = data.get('password')?.toString();
		if (user && password) {
			await updatePassword(user, password);
			return { success: true, message: 'Password changed' };
		}
		return { success: false, message: 'Password change failed' };
		;
	}
};