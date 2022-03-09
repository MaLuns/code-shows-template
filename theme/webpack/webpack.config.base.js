const path = require("path")
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports.baseConf = {
    entry: {
        'index': './src/index'
    },
    output: {
        path: path.resolve(__dirname, '../source/script/editor'),
        filename: '[name].min.js',
        library: {
            name: 'VEditor',
            type: 'window',
            export: 'default',
        },
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            compact: true,
                            presets: ['@babel/preset-env']
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
    ]
}
