import { crx } from '@crxjs/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

import manifest from './manifest.config'

// Self-contained build for the Papertrail Chrome extension.
// This directory is intended to be copyable and runnable on its own.
export default defineConfig({
    plugins: [vue(), crx({ manifest })],
    define: {
        __LIVE_RELOAD__: false,
    },
    resolve: {
        alias: {
            '@contracts': fileURLToPath(new URL('./src/contracts', import.meta.url)),
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: fileURLToPath(new URL('./src/pages/main.html', import.meta.url)),
            },
        },
    },
    server: {
        port: 5174,
        strictPort: true,
    },
})
