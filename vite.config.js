const mdPlugin = require('vite-plugin-markdown')
const hljs = require('highlight.js');

module.exports = {
    plugins: [mdPlugin({
        mode: ['vue', 'html'],
        markdownIt: {
            html: true,
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, str).value;
                    } catch (__) {}
                }

                return ''; // use external default escaping
            }
        }
    })]
}