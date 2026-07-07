import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (): Promise<{ version: string | undefined }> => {
	return { version: process.env.npm_package_version };
};
