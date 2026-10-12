# vendor/haruyuki

本目录是 **haruyuki 的 app-server 客户端 SDK 与协议类型** 的一份只读副本，
从 haruyuki 的构建产物拷贝而来，目的是让 GUI 仓库不必安装 haruyuki
那棵约 500MB 的依赖树。

**当前 pin：上游 [TZYLT/haruyuki](https://github.com/TZYLT/haruyuki) 的 `v0.2.0` 标签**
（参考 checkout 在 `~/haruyuki-upstream`，构建方式见 `scripts/setup-server.sh`）。

| 文件 | 来源 | 说明 |
|---|---|---|
| `app-server-client.js` | `dist/app-server-client.js` | 运行时客户端（ESM）。**完全自包含**，13KB，无外部 import |
| `app-server-client.cjs` | `dist/app-server-client.cjs` | 同上，CommonJS 版本 |
| `types/` | `dist/types/` | 协议类型声明。`types/app-server-client.d.ts` 是客户端入口，`types/types/app-server-protocol.d.ts` 是协议入口 |

- 上游许可：Apache-2.0（见仓库根 `LICENSE`）。
- 源码里一律写 `import … from "haruyuki/app-server-client"`。该裸导入由
  `electron.vite.config.ts` 的 alias（运行时）与两个 tsconfig 的 `paths`（类型）解析到本目录。
- **将来改用真正的 npm 包时**：`bun add haruyuki`，删掉那三处 alias/paths 映射即可，
  源码的 import 语句无需改动。

## 0.1.3 → 0.2.0 的同步结论：**不需要重新同步**

结论的依据**不是**"文件没变"，而是"**我们只依赖没变的那部分**"。这个区别很重要，
因为 0.2.0 确实新增了 32 个类型文件：

- 两份 `app-server-client.js` / `.cjs`：与 0.1.3 **逐字节一致**（`sha256` 比对）
- 四个**我们真正 import 的**契约文件：`app-server-client.d.ts`、
  `types/app-server-protocol.d.ts`、`types/protocol_v2.d.ts`、`types/app-server-info.d.ts`
  —— **全部一致**
- 0.2.0 新增的 32 个类型文件全是 `reminders/recall-*`、`backend/local/recall-*`、
  `recall-settings.d.ts` 等 **recall 服务端内部机制**，GUI 一个都不 import
- 另有 22 个文件 `differ`，差异也都在 recall 相关面（如 `backend.d.ts` 多了
  `getInContextMessageIds`）

⚠️ **不要用 `git diff --stat` 判断"类型有没有变"**。0.2.0 的新增文件在两版对比里
根本不出现，会得出"0 处变化"的错结论（这个坑真踩过）。要判断是否需要重同步，
正确的做法是**列出我们实际 import 的模块**再逐一 `cmp`。

## 重新同步（当上游改动到我们依赖的那部分时）

先装好参考仓（见 `scripts/setup-server.sh`），然后：

```bash
export PATH="$HOME/.bun/bin:$PATH"
REF="$HOME/haruyuki-upstream"
cd "$REF" && git fetch --tags && git checkout <新 tag> && bun install --frozen-lockfile && bun run build

cd ~/haruyuki-desktop
for f in app-server-client.js app-server-client.cjs; do
  cmp -s "$REF/dist/$f" "vendor/haruyuki/$f" || cp "$REF/dist/$f" vendor/haruyuki/
done
# 类型：只有在我们 import 的契约文件变化时才需要整体替换
rm -rf vendor/haruyuki/types && cp -R "$REF/dist/types" vendor/haruyuki/types
bun run vendor:sync   # 让 node_modules/haruyuki 指向新副本
```

同步后**必须**重跑 `bun run typecheck` 与三个 check，并更新本文件顶部的 pin。
