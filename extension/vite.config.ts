import { crx } from '@crxjs/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

import manifest from './manifest.config'

// Self-contained build for the Papertrail Chrome extension.
// This directory is intended to be copyable and runnable on its own.
export default defineConfig({
    plugins: [vue(), crx({ manifest })],
    resolve: {
        alias: {
            '@contracts': fileURLToPath(new URL('./src/contracts', import.meta.url)),
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 5174,
        strictPort: false,
    },
})
