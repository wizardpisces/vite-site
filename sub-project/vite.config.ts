import { defineConfig, UserConfigExport } from "vite";
import react from "@vitejs/plugin-react";
import { viteMockServe } from 'vite-plugin-mock'
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default ({ command }): UserConfigExport =>{
  return {
    server: {
      port: 3010,
    },
    build: {
      target: 'esnext',
      cssCodeSplit: false
    },
    plugins: [
      react(),
      federation({
        name: "remote-sub-app",
        filename: "remoteEntry.js",
        exposes: {
          "./Demo": "./src/pages/demo/index.tsx",
        },
        // shared: ["react"],
      }),
      /**
       * 原理1（通过客户端的请求到了server）：
       * * 自动搜索config文件生成middleware：拦截url请求并返回结果
       * * 在vite启动的时候注册到connect
       * 原理2（客户端的请求没有通过server，直接本地拦截）：
       * * 在入口文件注入代码片段
       * * 运行阶段拦截浏览器请求并直接（基于mockjs）
       */
      viteMockServe({
        // default
        mockPath: 'mock',// 目录下自动搜寻mock config 并注册到middleware
        localEnabled: command === 'serve',
        watchFiles:true

        // injectCode: `
        //   import { setupProdMockServer } from './mock/mockProdServer';
        //   setupProdMockServer();
        // `, // clientOnly mock
      }),
    ],
  }
  
};
