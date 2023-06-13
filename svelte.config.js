import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';
import preprocess from 'svelte-preprocess';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			piperchat: 'src/lib/index.js'
		}
	},
	preprocess: preprocess({
		postcss:
			process.env.NODE_ENV === 'development'
				? true // use app.css when developing to preview the styles
				: {
						// use @import when building packages for distribution
						configFilePath: path.resolve(__dirname, './postcss.config.cjs'),
						prependData: `@tailwind utilities;`
				  }
	})
};

export default config;
