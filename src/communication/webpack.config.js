const path = require("path");

module.exports = {
    entry: "./worker.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        configFile: "./communication-tsconfig.json",
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            "@": path.resolve(__dirname, "../"),
        },
    },
    output: {
        filename: "worker.js",
        // path: path.resolve(__dirname, "dist"),
        path: path.resolve(__dirname, "../../public"),
    },
};
