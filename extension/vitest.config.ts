import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Standalone test config so the CRX build plugin (vite.config.ts) isn't loaded
// during unit tests. Mirrors the path aliases used by the source.
export default defineConfig({
    resolve: {
        alias: {
            '@contracts': fileURLToPath(new URL('./src/contracts', import.meta.url)),
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
})
