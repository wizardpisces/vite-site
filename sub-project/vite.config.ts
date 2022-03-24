import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import qiankun from "vite-plugin-qiankun";

const useDevMode = false;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    ...(useDevMode ? [] : [react()]),
    qiankun("appReact", {
      useDevMode,
    }),
  ],
  server: {
    port: 3001,
  },
});
