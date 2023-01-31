const { defineConfig } = require('@vue/cli-service')
const path = require('path')

var configureWebpack = (config) => {
    // if (process.env.NODE_ENV === 'production') {
    //   // 为生产环境修改配置...
    // } else {
    //   // 为开发环境修改配置...
    // }
    // config.module.rules.delete("svg"); //重点:删除默认配置中处理svg,
    const iconspath = path.resolve('src/assets/icons');
    const svgrules = [];
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
        // {
        //     test: /\.si?$/,
        //     use: [
        //         'vue-loader',
        //         path.resolve('./build/comp-svg-loader.js'),
        //         {
        //             loader: 'svg-sprite-loader', 
        //             options: {
        //                 symbolId: "icon-[name]",
        //             },
        //         },
        //         {
        //             loader: 'svgo-loader',
        //             options: {
        //                 plugins: [
        //                 {
        //                     name: 'convertColors',
        //                     params: { currentColor: true },
        //                 },
        //                 ],
        //             },
        //         }
        //     ],
        //     include: [iconspath],
        //     exclude: /node_modules/,
        // }
        )
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