const hljs = require('highlight.js');
import vue from '@vitejs/plugin-vue'
import md2HtmlPlugin from './plugins/vite-plugin-markdown2html'

export default {
    plugins: [
        vue(),
        md2HtmlPlugin({
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
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "./src/klk-ui-v3/styles/vars.scss" as *;`
            },
        },
    },
}