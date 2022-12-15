const path = require('path');

module.exports = {
    mode: 'development', // production, development
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

};