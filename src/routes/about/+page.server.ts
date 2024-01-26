// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import packageJSON from './package.json';
import { PageServerLoad } from '../../../.svelte-kit/types/src/routes/$types';

export const load: PageServerLoad = async (): Promise<{ version: string }> => {
	console.log('package version', packageJSON.version);
	return { version: packageJSON.version };
};