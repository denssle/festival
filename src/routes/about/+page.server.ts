import { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';

export const load: PageServerLoad = async (): Promise<{ version: string | undefined }> => {
	return { version: process.env.npm_package_version };
};
