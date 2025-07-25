import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createHtmlPlugin } from 'vite-plugin-html';
import vueJsx from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';
import basicSsl from '@vitejs/plugin-basic-ssl';
const mode = process.env.NODE_ENV;
const PRODUCTION = mode === 'production';
console.log('config for ' + mode);

const isDevServer = !!process.env.IS_DEV_SERVER;
console.log('is dev server: ', isDevServer);

export default defineConfig({

    base: undefined,
    define: Object.entries({
        global: 'window',
        IS_PRODUCTION: PRODUCTION,
        IS_DEV_SERVER: isDevServer,
    }).reduce((res, [key, value]) => {
        res[key] = JSON.stringify(value);
        return res;
    }, {} as any),

    build: {
        assetsInlineLimit: 1024 * 40,
        minify: PRODUCTION ? "terser" : false,
        terserOptions: {
            compress: {
                // drop_console: PRODUCTION,
                drop_debugger: PRODUCTION,
            },
            format: {
                comments: !PRODUCTION
            },
        },
        commonjsOptions: { transformMixedEsModules: false },
        sourcemap: !PRODUCTION,
        rollupOptions: {
            output: {
                entryFileNames: '[name]-[hash].js',
                dir: 'dist_client',
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString();
                    }
                },
            },
        },
    },
    plugins: [
        svgLoader({
            // svgo: false,
            defaultImport: 'url',
            svgoConfig: {
                plugins: [{
                    name: 'convertColors',
                }],
            }
        }),
        vue(),
        vueJsx(),
        createHtmlPlugin({
            minify: true,
            template: 'public/index.html',
            entry: '/client/index.ts',
        }),

        basicSsl(),
    ],
    server: {
        host: '0.0.0.0',
        // @ts-ignore
        https: true,
        hmr: false,
        port: 8088,
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }

})
