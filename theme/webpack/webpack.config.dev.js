const { baseConf } = require('./webpack.config.base')
const { merge } = require('webpack-merge')

module.exports = merge(baseConf, {
    mode: 'development',
    watch: true,
    watchOptions: {
        aggregateTimeout: 500,
        poll: 1000,
        ignored: ['**/node_modules', '**/source', "**/layout"] //忽略时时监听
    }
})
