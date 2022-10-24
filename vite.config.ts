import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://vue-mediapipe-backend:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    host: "0.0.0.0",
  },
  // use of esbuild to optimize dependencies during build time
  optimizeDeps: {
    disabled: false,
  },
  build: {
    // because esbuild so we never need @rollup/plugin-commonjs and remove it
    commonjsOptions: {
      include: [],
    },
  },
});
