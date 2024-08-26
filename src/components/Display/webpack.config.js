const path = require("path");

module.exports = {
    entry: {
        "prototype": "./index.ts",
    },
    target: "web",
    module: {
        rules: [
            {
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            "@": path.resolve(__dirname, "../"),
        },
    },
    output: {
        filename: "[name]-prototype.js",
        path: path.resolve(__dirname, "./"),
    },
};
