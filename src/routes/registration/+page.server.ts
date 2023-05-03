import * as userController from '$lib/server/user-controller';
import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ cookies, request }) => {
		const values = await request.formData();
		const emailValue = values.get('email');
		const passwordValue = values.get('password');
		console.log('registration default action: ', emailValue, passwordValue);
		if (emailValue && passwordValue) {
			const email = String(emailValue);
			if (userController.emailInvalid(email)) {
				return fail(409, { success: false, errorMessage: 'Email already existing' });
			} else {
				const password = String(passwordValue);
				userController.register(email, password);
				throw redirect(303, '/login');
			}
		}
		return { success: false, errorMessage: 'Password and / or Email missing' };
	}
} satisfies Actions;