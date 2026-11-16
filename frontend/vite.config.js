import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        // Lets imports use "@/..." to mean "frontend/src/...".
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
        port: 5173,
        // During development (npm run dev) the Vue app runs on :5173 and the API on :3000.
        // This proxy forwards /api requests to Express, so the frontend can always call
        // "/api/..." -- the same relative URL that works in the production build.
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },
    build: {
        outDir: 'dist', // Express serves this folder in production (Part 5).
        emptyOutDir: true,
    },
});
