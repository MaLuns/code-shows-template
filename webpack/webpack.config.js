const TerserPlugin = require('terser-webpack-plugin');
const { baseConf } = require('./webpack.config.base')
const { merge } = require('webpack-merge')

module.exports = merge(baseConf, {
    mode: 'production',
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
})
