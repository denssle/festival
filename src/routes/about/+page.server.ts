import { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';
import { env } from '$env/dynamic/private';
const { MARIA_DB_NAME } = env;

export const load: PageServerLoad = async (): Promise<{ version: string | undefined; db: string | undefined }> => {
	return { version: process.env.npm_package_version, db: MARIA_DB_NAME };
};
