import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        outDir: path.resolve(__dirname, 'src/resources/assets/dist'),
        emptyOutDir: false,

        lib: {
            entry: path.resolve(__dirname, 'src/resources/assets/browser/browser.js'),
            formats: ['es'],
            fileName: () => 'browser.min.js',
        },

        minify: 'terser',

        terserOptions: {
            compress: {
                passes: 3,
                drop_console: false,
                drop_debugger: false,
            },
            mangle: true,
            format: {
                comments: false,
            },
        },

        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.css')) {
                        return 'browser.min.css';
                    }

                    return '[name][extname]';
                },
            },
        },
    },
});
