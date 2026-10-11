import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

/**
 * `haruyuki/app-server-client` 指向本地 vendor 的那份（从本地 haruyuki 构建产物拷来）。
 * 这样源码里写的 import 语句与将来改用 npm 包时完全一致，切换只需删掉这条 alias。
 */
const alias = {
  "@": resolve("src"),
  "haruyuki/app-server-client": resolve("vendor/haruyuki/app-server-client.js"),
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      rollupOptions: {
        // electron 是 devDependency，externalizeDepsPlugin 不会外部化它；
        // 一旦被打进 bundle，electron/index.js 的 __dirname 就变成 out/main，
        // 它会找不到 path.txt 并报 "Electron failed to install correctly"。
        external: ["electron"],
        input: { index: resolve("src/main/index.ts") },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      rollupOptions: {
        external: ["electron"],
        input: { index: resolve("src/preload/index.ts") },
      },
    },
  },
  renderer: {
    root: resolve("src/renderer"),
    plugins: [react()],
    resolve: { alias },
    build: {
      rollupOptions: { input: { index: resolve("src/renderer/index.html") } },
    },
  },
});
