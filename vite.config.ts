import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from "vite-plugin-dts";
import arraybuffer from "vite-plugin-arraybuffer";

const PRODUCTION = process.env.NODE_ENV === 'production';
console.log('config for ' + process.env.NODE_ENV);

export default defineConfig({
    define: Object.entries({
        global: 'window',
    }).reduce((res, [key, value]) => {
        res[key] = JSON.stringify(value);
        return res;
    }, {} as any),
    build: {
        minify: PRODUCTION ? "terser" : false,
        terserOptions: {
            compress: {
                drop_console: PRODUCTION,
                drop_debugger: PRODUCTION,
            },
            format: {
                comments: !PRODUCTION
            },
        },
        lib: {
            entry: 'src/index.ts',
            name: 'kcdesign',
            fileName: (_) => `index.${_}.js`,
            formats: ['es'], // ['es', 'cjs']
        },
        sourcemap: !PRODUCTION,
        rollupOptions: {
            external: ['vue', 'element-plus', 'jszip', 'lodash', 'moment', 'uuid', 'vue-i18n', '@kcdesign/data'],
            output: {
                dir: 'dist'
            },
            plugins: []
        }
    },
    plugins: [
        arraybuffer(),
        vue(),
        cssInjectedByJsPlugin(),
        dts({
            outDir: "dist/types",
            rollupTypes: PRODUCTION
        }),
    ],
    server: {
        hmr: false
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@pal': fileURLToPath(new URL('./src/PAL/browser', import.meta.url))
        }
    }
})
