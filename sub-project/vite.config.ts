import { defineConfig, UserConfigExport } from "vite";
import react from "@vitejs/plugin-react";
import { viteMockServe } from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default ({ command }): UserConfigExport =>{
  return {
    plugins: [
      react(),
      viteMockServe({
        // default
        mockPath: 'mock',
        localEnabled: command === 'serve',
        injectCode: `
          import { setupProdMockServer } from './mock/mockProdServer';
          setupProdMockServer();
        `,
      }),
    ],

    server: {
      port: 3001,
    },
  }
  
};
