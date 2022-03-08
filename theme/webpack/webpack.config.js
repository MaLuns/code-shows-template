const { baseConf } = require('./webpack.config.base')
const { merge } = require('webpack-merge')

module.exports = merge(baseConf, {
    mode: 'production',
})
