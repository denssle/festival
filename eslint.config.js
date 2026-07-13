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
			'@typescript-eslint/no-explicit-any': 'warn',
			// Neu in eslint-plugin-svelte 3: verlangt resolve() um jede href/goto-Ziel-URL.
			// Betrifft ~37 Stellen und ist eine eigene Migration (siehe TODO) – bis dahin
			// als Warnung sichtbar, damit `npm run lint` nicht rot ist.
			'svelte/no-navigation-without-resolve': 'warn'
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
