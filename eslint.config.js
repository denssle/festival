import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'warn',
			// Scharf ab v0.7.18: src und tests sind any-frei. Sequelize-Modelle nutzen
			// abgeleitete *CreationAttributes-Typen statt `Model<T, any>` – kein neues any.
			'@typescript-eslint/no-explicit-any': 'error',
			// Scharf ab v0.7.20: alle href/goto-Ziele laufen über resolve() aus $app/paths.
			// Dynamische Routen nutzen die Route-ID plus Parameter, z. B.
			// resolve('/user/[user_id]', { user_id: id }) – damit prüft TypeScript die Route.
			'svelte/no-navigation-without-resolve': 'error'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		// Scharf ab v0.7.23: Identität kommt ausschließlich aus locals.currentUser
		// (vom Auth-Hook aus der DB geladen). Direkter Zugriff auf den Session-Cookie
		// ist nur im Hook selbst und im UserService (createSession/logout) erlaubt –
		// überall sonst wäre er eine Umgehung der zentralen Session-Validierung.
		files: ['src/**/*.ts', 'src/**/*.svelte'],
		ignores: ['src/hooks.server.ts', 'src/lib/services/user.service.ts'],
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: "CallExpression[callee.property.name=/^(get|set|delete)$/][arguments.0.value='session']",
					message:
						'Session-Cookie nicht direkt lesen/schreiben – Identität kommt aus locals.currentUser (Auth-Hook); Session-Verwaltung gehört in den UserService.'
				}
			]
		}
	},
	{
		// Ersetzt die frühere .eslintignore (ab ESLint 9 nicht mehr unterstützt)
		ignores: [
			'.DS_Store',
			'node_modules/',
			'build/',
			'.svelte-kit/',
			'package/',
			'.env',
			'.env.*',
			'!.env.example',
			'pnpm-lock.yaml',
			'package-lock.json',
			'yarn.lock'
		]
	}
);
