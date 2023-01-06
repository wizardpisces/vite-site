import hljs from 'highlight.js';
import path from 'path';
import vue from '@vitejs/plugin-vue'
import viteSvgIcons from 'vite-plugin-svg-icons';
// import md2HtmlPlugin from './plugins/vite-plugin-markdown2html'
import md2HtmlPlugin from 'vite-plugin-md2html'
import macrosPlugin from "vite-plugin-babel-macros"

export default {
  server: {
    port: 3000,
  },
  plugins: [
    vue(),
    viteSvgIcons({
      iconDirs: [path.resolve(__dirname, "src/assets/svg")],
      symbolId: "icon-[name]",
    }),
    md2HtmlPlugin({
      markdownIt: {
        html: true,
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(lang, str).value;
            } catch (__) {}
          }

          return ""; // use external default escaping
        },
      },
    }),
    macrosPlugin(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "./src/v3-ui/styles/vars.scss" as *;`,
      },
    },
  },
};