const path = require('path');

module.exports = {
    mode: 'production', // development
    entry: './src/server.main.ts',
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
    resolve: {
        fallback: {
            // "path": false,
            // "zlib": require.resolve('browserify-zlib'),
            // "stream": require.resolve("stream-browserify"),
            // "fs": false,
        },
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
            // "raphael": path.resolve(__dirname, 'src/raphael/raphael.amd.d.ts')
            // zlib: require.resolve('browserify-zlib')
        },
    },
    externals: {
        'fs': 'require("fs")',
        'path': 'require("path")',
        'stream': 'require("stream")',
        'zlib': 'require("zlib")'
    }
};