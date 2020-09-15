const mdPlugin = require('vite-plugin-markdown')

module.exports = {
    plugins: [mdPlugin({
        mode: ['vue', 'html']
    })]
}