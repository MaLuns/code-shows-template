const path = require("path");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.ttf$/,
                use: ['file-loader']
            }
        ]
    },
    resolve: {
        fallback: {
            path: false
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MonacoWebpackPlugin({
            languages: [
                'coffee', 'css', , 'html', 'javascript', 'json', 'less', 'pug', , 'scss', 'typescript', 'markdown'
            ],
            features: [
                '!contextmenu', '!folding',
            ],
            filename: 'worker/[name].worker.min.js'
        }),
        new CopyWebpackPlugin({
            patterns:
                [
                    { from: './src/grammars', to: path.resolve(__dirname, '../source/script/editor/grammars') },
                    { from: './src/themes', to: path.resolve(__dirname, '../source/script/editor/codetheme') },
                    { from: './node_modules/onigasm/lib/onigasm.wasm', to: path.resolve(__dirname, '../source/script/editor/onigasm') }
                ]
        })
    ]
}
