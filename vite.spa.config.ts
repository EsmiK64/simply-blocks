import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
            '@inertiajs/react': path.resolve(__dirname, './resources/js/lib/inertia-shim.tsx'),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});
