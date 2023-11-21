import type { Cookies } from '@sveltejs/kit';
import type { FrontendUser } from '$lib/models/FrontendUser';
import { error } from '@sveltejs/kit';
import { extractUser, loadFrontEndUserById, parseToFrontEnd } from '$lib/services/user-service';
import type { BackendUser } from '$lib/models/BackendUser';
import type { PageServerLoad, RouteParams } from '../../user/[user_id]/$types';

export const load: PageServerLoad = async ({
	cookies,
	params
}: {
	cookies: Cookies;
	params: RouteParams;
}): Promise<{ user: FrontendUser; isOwnProfil: boolean }> => {
	const userId: string = params.user_id;
	if (userId) {
		const user: BackendUser | null = extractUser(cookies.get('session'));
		if (user && userId === user.id) {
			return {
				user: parseToFrontEnd(user),
				isOwnProfil: true
			};
		} else {
			const loaded: FrontendUser | undefined = await loadFrontEndUserById(userId);
			if (loaded) {
				return {
					user: loaded,
					isOwnProfil: false
				};
			}
		}
	}
	throw error(404, 'Not Found');
};
