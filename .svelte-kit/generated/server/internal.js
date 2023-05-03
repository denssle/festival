
import root from '../root.svelte';
import { set_building } from '__sveltekit/environment';
import { set_assets } from '__sveltekit/paths';
import { set_private_env, set_public_env } from '../../../node_modules/@sveltejs/kit/src/runtime/shared-server.js';

export const options = {
	app_template_contains_nonce: false,
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	hooks: null, // added lazily, via `get_hooks`
	preload_strategy: "modulepreload",
	root,
	service_worker: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!DOCTYPE html>\r\n<html lang='en'>\r\n<head>\r\n\t<meta charset='utf-8' />\r\n\t<link rel='icon' href='" + assets + "/favicon.png' />\r\n\t<meta name='viewport' content='width=device-width' />\r\n\t" + head + "\r\n</head>\r\n<title>hello svelte</title>\r\n<body data-sveltekit-preload-data='hover'>\r\n<div style='display: contents'>" + body + "</div>\r\n</body>\r\n</html>\r\n",
		error: ({ status, message }) => "<h2>ERROR!</h2>"
	},
	version_hash: "1f7fe2j"
};

export function get_hooks() {
	return import("../../../src/hooks.server.ts");
}

export { set_assets, set_building, set_private_env, set_public_env };
