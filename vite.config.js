import mdPlugin from 'vite-plugin-markdown'
const hljs = require('highlight.js');
import vue from '@vitejs/plugin-vue'

export default {
    plugins: [
        vue(),
        mdPlugin({
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
        })
    ]
}