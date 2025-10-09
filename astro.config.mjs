// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
    site: 'https://alesyatakun.by',
    base: '/',
    output: 'server',
    adapter: netlify({
        edgeMiddleware: false
    }),
    build: {
        assets: '_assets'
    }
});
