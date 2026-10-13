/**
 * 由 vendor/haruyuki 生成 node_modules/haruyuki。
 *
 * 目的：让 `import … from "haruyuki/app-server-client"` 在 **Node / bun / Vite / tsc**
 * 四种解析器下都成立 —— 包括在不起 Electron 的情况下直接跑主进程模块做联调测试。
 *
 * 这份产物是 devDependency 的一种替代：haruyuki 的完整依赖树约 500MB，
 * 而客户端 SDK 本体只有 13KB 且完全自包含。
 */
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const target = join(root, "node_modules", "haruyuki");

rmSync(target, { recursive: true, force: true });
mkdirSync(join(target, "dist"), { recursive: true });

cpSync(join(root, "vendor/haruyuki/app-server-client.js"), join(target, "dist/app-server-client.js"));
cpSync(join(root, "vendor/haruyuki/app-server-client.cjs"), join(target, "dist/app-server-client.cjs"));
cpSync(join(root, "vendor/haruyuki/types"), join(target, "dist/types"), { recursive: true });

writeFileSync(
  join(target, "package.json"),
  `${JSON.stringify(
    {
      name: "haruyuki",
      version: "0.2.0-vendored",
      private: true,
      type: "module",
      exports: {
        "./app-server-client": {
          types: "./dist/types/app-server-client.d.ts",
          import: "./dist/app-server-client.js",
          require: "./dist/app-server-client.cjs",
          default: "./dist/app-server-client.js",
        },
        "./app-server-protocol": {
          types: "./dist/types/types/app-server-protocol.d.ts",
        },
      },
    },
    null,
    2,
  )}\n`,
);

console.log("[vendor] node_modules/haruyuki 已由 vendor/haruyuki 生成");
