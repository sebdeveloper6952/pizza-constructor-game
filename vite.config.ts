import process from 'node:process';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/,
// so we need a base path in production. Set BASE_PATH at build time, e.g.
//   BASE_PATH=/classes-and-objects npm run build
// Locally (dev / preview) it stays empty so the app runs at the root.
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Static site generation so the whole thing can be hosted on GitHub Pages.
			adapter: adapter({
				fallback: '404.html'
			}),

			paths: {
				base
			}
		})
	]
});
