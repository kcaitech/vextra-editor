const { defineConfig } = require('@vue/cli-service')
const path = require('path')

var configureWebpack = (config) => {
    // if (process.env.NODE_ENV === 'production') {
    //   // 为生产环境修改配置...
    // } else {
    //   // 为开发环境修改配置...
    // }

    config.resolve = {
        fallback: {
            "path": false,
            "zlib": false,
            "stream": false, //require.resolve("stream-browserify")
            "fs": false,
        },
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
            // "raphael": path.resolve(__dirname, 'src/raphael/raphael.amd.d.ts')
        },
    }
}

var exports = defineConfig({
    transpileDependencies: true,

    configureWebpack,

    pluginOptions: {
        electronBuilder: {
            //preload: 'src/preload.js',
            nodeIntegration: true,
            //contextIsolation: false
        }
    }

})

module.exports = exports;