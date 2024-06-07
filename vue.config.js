const {defineConfig} = require('@vue/cli-service')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
// 按需引入element ui
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const {ElementPlusResolver} = require('unplugin-vue-components/resolvers')
const CopyWebpackPlugin = require("copy-webpack-plugin")
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin');

let IS_PRODUCTION = process.env.BUILD_ENV === 'production'

console.log("BUILD_ENV: ", process.env.BUILD_ENV)

let envSuffix = !IS_PRODUCTION ? process.env.ENV_SUFFIX : "";
if (envSuffix) {
    if (envSuffix[0] !== '/') envSuffix = '/' + envSuffix;
    if (envSuffix[envSuffix.length - 1] !== '/') envSuffix += '/';
} else {
    envSuffix = '/';
}

var configureWebpack = (config) => {
    if (IS_PRODUCTION) {
        // 为生产环境修改配置...
        config.optimization.minimizer.push(
            new TerserPlugin({
                terserOptions: {
                    compress: true,
                    parallel: true,
                },
            })
        )
    } else {
        // 为开发环境修改配置...
    }

    config.entry.app = ['./src/web.main.ts']
    config.resolve.alias[`@pal`] = path.resolve(__dirname, 'src/PAL/browser')

    config.resolve.mainFields = ['module', 'browser', 'main']

    const iconspath = path.resolve('src/assets/icons');
    config.module.rules.forEach(element => {
        if (!'.svg'.match(element.test)) {
            //
        } else if (!element.exclude) {
            element.exclude = iconspath;
        } else if (element.exclude instanceof Array) {
            element.exclude.push(iconspath)
        } else {
            element.exclude = [element.exclude, iconspath]
        }
    });

    config.resolve.fallback = {
        "path": false,
        "zlib": false,
        "stream": false, //require.resolve("stream-browserify")
        "fs": false,
    }

    config.resolve.alias["vue-i18n"] = "vue-i18n/dist/vue-i18n.esm-browser.prod.js";

    config.module.rules.push(
        {
            test: /\.svg?$/,
            use: [
                {
                    loader: 'svg-sprite-loader',
                    options: {
                        symbolId: "icon-[name]",
                    },
                },
                {
                    loader: 'svgo-loader',
                    options: {
                        plugins: [
                            {
                                name: 'convertColors',
                                // params: { currentColor: true },
                            },
                        ],
                    },
                }
            ],
            include: [iconspath],
            exclude: /node_modules/,
        }
    )

    config.module.rules.push(
        {
            test: /\.md?$/,
            use: [
                {
                    loader: 'raw-loader',
                },
            ],
        },
    )

    const communicationWorkerSourcePath = path.resolve(__dirname, 'src/communication/communication.js')
    const communicationWorkerTargetFilename = `static/communication.${crypto.createHash('md5')
        .update(fs.readFileSync(communicationWorkerSourcePath))
        .digest('hex')
        .slice(0, 8)
    }.js`
    config.plugins = [
        AutoImport({resolvers: [ElementPlusResolver()]}),
        Components({resolvers: [ElementPlusResolver()]}),
        new CopyWebpackPlugin({
            patterns: [{
                from: communicationWorkerSourcePath,
                to: communicationWorkerTargetFilename,
            }]
        }),
        new webpack.DefinePlugin({
            COMMUNICATION_WORKER_URL: JSON.stringify(`${envSuffix}${communicationWorkerTargetFilename}`),
            ENV_SUFFIX: JSON.stringify(envSuffix),
            IS_PRODUCTION: JSON.stringify(IS_PRODUCTION),
        }),
        new CopyWebpackPlugin({
            patterns: [{
                from: "src/assets/GetCode.html",
                to: "static/GetCode.html",
            }]
        }),
        new CopyWebpackPlugin({
            patterns: [{
                from: "node_modules/pathkit-wasm/bin/pathkit.wasm",
                to: "static/pathkit.wasm",
            }]
        }),
        ...config.plugins,
    ]

    config.watchOptions = {
        ignored: [
            "node_modules\\/(?!(@kcdesign)\\/)",
            "communication\\/node_modules\\/)",
        ],
        poll: 5000,
    }

    if (IS_PRODUCTION) {
        config.devtool = "hidden-source-map"
    }
}

var exports = defineConfig({
    chainWebpack: (config) => {
        config.plugin('define').tap((definitions) => {
            Object.assign(definitions[0], {
                __VUE_OPTIONS_API__: 'true',
                __VUE_PROD_DEVTOOLS__: 'false',
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
            })
            return definitions
        })
        config.plugin('html').tap((args) => {
            args[0].title = ""
            return args
        })
    },
    transpileDependencies: true,
    publicPath: envSuffix,
    assetsDir: "static",
    configureWebpack,

    pluginOptions: {
        electronBuilder: {
            //preload: 'src/preload.js',
            nodeIntegration: true,
            //contextIsolation: false
        }
    },

    // https://webpack.js.org/configuration/dev-server/
    devServer: {
        port: 8080,
        https: true,
        proxy: {
            '/api': {
                target: 'http://192.168.0.10:10000',
                // target: 'http://mock.apifox.cn/m1/2612240-0-1d5a81b5',
                changeOrigin: true,
                disableHostCheck: true,
                //ws: true,
                pathRewrite: {
                    '^/api': '/api'
                    // '^/api/v1': '/'
                }
            },
        },
        static: {
            directory: path.join(__dirname, "public"),
        },
        compress: true,
        historyApiFallback: {
            index: `${envSuffix}index.html`,
            verbose: true,
        },
    },
})

module.exports = exports