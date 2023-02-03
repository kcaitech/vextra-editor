const { defineConfig } = require('@vue/cli-service')
const path = require('path')

var run_env = 'browser'
// var run_env = 'nodejs'

var configureWebpack = (config) => {
    // if (process.env.NODE_ENV === 'production') {
    //   // 为生产环境修改配置...
    // } else {
    //   // 为开发环境修改配置...
    // }
    if (run_env === 'browser') {
        config.entry.app = [ './src/web.main.ts' ]
        config.resolve.alias[`@pal`] = path.resolve(__dirname, 'src/PAL/browser')
    } else {
        config.entry.app = [ './src/electron.main.ts' ]
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