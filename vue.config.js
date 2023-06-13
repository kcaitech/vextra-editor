const { defineConfig } = require('@vue/cli-service')
const path = require('path')
// 按需引入element ui
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const CopyWebpackPlugin = require("copy-webpack-plugin");

var run_env = process.env.npm_lifecycle_event.indexOf(':web') !== -1 ? 'browser' : 'nodejs';
// var run_env = 'nodejs'
console.log('building for: ' + run_env)
var configureWebpack = (config) => {
    // if (process.env.NODE_ENV === 'production') {
    //   // 为生产环境修改配置...
    // } else {
    //   // 为开发环境修改配置...
    // }
    if (run_env === 'browser') {
        config.entry.app = ['./src/web.main.ts']
        config.resolve.alias[`@pal`] = path.resolve(__dirname, 'src/PAL/browser')
    } else {
        config.entry.app = ['./src/electron.main.ts']
        config.resolve.alias[`@pal`] = path.resolve(__dirname, 'src/PAL/nodejs')
    }

    const iconspath = path.resolve('src/assets/icons');
    config.module.rules.forEach(element => {
        if (!'.svg'.match(element.test)) {
            //
        }
        else if (!element.exclude) {
            element.exclude = iconspath;
        }
        else if (element.exclude instanceof Array) {
            element.exclude.push(iconspath)
        }
        else {
            element.exclude = [element.exclude, iconspath]
        }
    });

    config.resolve.fallback = {
        "path": false,
        "zlib": false,
        "stream": false, //require.resolve("stream-browserify")
        "fs": false,
    }

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
                                params: { currentColor: true },
                            },
                        ],
                    },
                }
            ],
            include: [iconspath],
            exclude: /node_modules/,
        },
    )

    config.plugins = [
        AutoImport({ resolvers: [ElementPlusResolver()] }),
        Components({ resolvers: [ElementPlusResolver()] }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'node_modules/pathkit-wasm/bin/pathkit.wasm' }
            ]
        }),
        ...config.plugins
    ]

    // config.watchOptions = {
    //     ignored: ["node_modules\\/(?!(@kcdesign)\\/)"],
    //     poll: 500
    // }
}

var exports = defineConfig({
    transpileDependencies: true,
    // publicPath: './',
    publicPath: '/zbb',
    configureWebpack,

    pluginOptions: {
        electronBuilder: {
            //preload: 'src/preload.js',
            nodeIntegration: true,
            //contextIsolation: false
        }
    },

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
            }
        }
    }

})
module.exports = exports