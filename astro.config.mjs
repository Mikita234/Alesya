// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
    site: 'https://alesyatakun.by',
    base: '/',
    output: 'server',
    adapter: vercel(),
    build: {
        assets: '_assets'
    }
});
