const path = require('path');
const nodeExternals = require('webpack-node-externals');

let mode = ''
if (process.env.NODE_ENV === 'production') {
    // 为生产环境修改配置...
    mode = 'production'
} else {
    // 为开发环境修改配置...
    mode = 'development'
}
console.log('building for: ' + mode)

module.exports = {
    mode,
    entry: './src/server.main.ts',
    target: 'node',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist_server'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    // node: {
    //     net: "empty"
    // },
    resolve: {
        fallback: {
            // "path": false,
            // "zlib": require.resolve('browserify-zlib'),
            // "stream": require.resolve("stream-browserify"),
            // "fs": false,
            // "http": require.resolve("stream-http"),
            // "crypto": require.resolve("crypto-browserify")
        },
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
            // "raphael": path.resolve(__dirname, 'src/raphael/raphael.amd.d.ts')
            // zlib: require.resolve('browserify-zlib')
            '@pal': path.resolve(__dirname, 'src/PAL/nodejs')
        },
    },
    // externals: {
    //     'fs': 'require("fs")',
    //     'path': 'require("path")',
    //     'stream': 'require("stream")',
    //     'zlib': 'require("zlib")',
    //     'http': 'require("http")',
    //     'crypto': 'require("crypto")',
    //     'net': 'require("net")',
    //     'async_hooks': 'require("async_hooks")'
    // }
    externals: [nodeExternals()]
};