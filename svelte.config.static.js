import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

const dev = process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	extensions: ['.svelte', '.svx'],
	kit: {
		appDir: 'app', // Required as the default is _app
		paths: {
			base: dev ? '' : process.env.BASE_PATH
		},
		adapter: adapter({
			fallback: 'index.html' // may differ from host to host
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				/*
				// ignore deliberate link to shiny 404 page
				if (path === '/not-found' && referrer === '/blog/how-we-built-our-404-page') {
					return;
				}
				*/

				// otherwise fail the build
				throw new Error(message);
			}
		},
		csrf: { checkOrigin: false }
	}
};

export default config;
