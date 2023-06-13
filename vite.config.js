import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	// add piperchat package alias
	resolve: {
		alias: {
			// piperchat: 'src/lib/index.js'
		}
	}
});
