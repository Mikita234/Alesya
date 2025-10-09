// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://alesyatakun.by',
    base: '/',
    output: 'server',
    build: {
        assets: '_assets'
    }
});
