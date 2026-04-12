import { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import { MARIA_DB_NAME } from '$env/static/private';

export const load: PageServerLoad = async (): Promise<{ version: string | undefined }> => {
	return { version: process.env.npm_package_version, db: MARIA_DB_NAME };
};
