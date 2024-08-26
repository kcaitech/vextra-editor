import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import dts from "vite-plugin-dts";
import arraybuffer from "vite-plugin-arraybuffer";

const PRODUCTION = process.env.NODE_ENV === 'production'
console.log('config for ' + process.env.NODE_ENV)

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        define: Object.entries({
            global: 'window',
            'process.env': env
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
                fileName: (_,entryName) => `index.${entryName}.js`,
                formats: ['es']
        },
        sourcemap: !PRODUCTION,
            rollupOptions: {
            input: {
                prototype: 'src/components/Display/index.ts'
            },
            output: {
                dir: 'dist'
            },
            plugins: []
        },
        emptyOutDir: false
    },
        plugins: [
            arraybuffer(),
            vue(),
            cssInjectedByJsPlugin()
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
    }
})
