import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.ts', 'tests/*.{test,spec}.ts'],
		exclude: ['tests/**/*.spec.ts'] // Exclude Playwright tests from unit tests
	}
});
