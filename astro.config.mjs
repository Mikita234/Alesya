// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://mikita234.github.io',
    base: '/Alesya',
    output: 'static',
    build: {
        assets: '_assets'
    }
});
