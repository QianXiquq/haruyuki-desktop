# vendor/haruyuki

本目录是 **haruyuki 的 app-server 客户端 SDK 与协议类型** 的一份只读副本，
从本地 haruyuki 构建产物拷贝而来，目的是让 GUI 仓库不必安装 haruyuki
那棵约 500MB 的依赖树。

| 文件 | 来源 | 说明 |
|---|---|---|
| `app-server-client.js` | `dist/app-server-client.js` | 运行时客户端（ESM）。**完全自包含**，13KB，无外部 import |
| `app-server-client.cjs` | `dist/app-server-client.cjs` | 同上，CommonJS 版本 |
| `types/` | `dist/types/` | 协议类型声明（4.7MB）。`types/app-server-client.d.ts` 是客户端入口，`types/types/app-server-protocol.d.ts` 是协议入口 |

- 上游许可：Apache-2.0（见仓库根 `LICENSE`）。
- 源码里一律写 `import … from "haruyuki/app-server-client"`。该裸导入由
  `electron.vite.config.ts` 的 alias（运行时）与两个 tsconfig 的 `paths`（类型）解析到本目录。
- **将来改用真正的 npm 包时**：`bun add haruyuki`，删掉那三处 alias/paths 映射即可，
  源码的 import 语句无需改动。

## 重新同步

本地 haruyuki 源码仓重新构建后（`cd /Users/qianxiquq/haruyuki && bun run build`），重跑：

```bash
cp /Users/qianxiquq/haruyuki/dist/app-server-client.js  vendor/haruyuki/
cp /Users/qianxiquq/haruyuki/dist/app-server-client.cjs vendor/haruyuki/
rm -rf vendor/haruyuki/types && cp -R /Users/qianxiquq/haruyuki/dist/types vendor/haruyuki/types
```
