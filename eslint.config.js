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
