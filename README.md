# haruyuki-desktop

**中文 · [English](README.en.md)**

[haruyuki](https://github.com/TZYLT/haruyuki) 的**非官方桌面客户端**。haruyuki 本身是一个
local-first 的终端运行时，用来跑有状态、长期存活的 agent。

haruyuki 本体是 TUI。这是一个独立的 Electron 客户端，说同一套 app-server WebSocket 协议 ——
所以 agent、记忆、会话都是同一份，只是换成了图形界面：窗口、侧栏、鼠标。

> **与 haruyuki 项目无关联。** 这是一个独立客户端，不是官方出品。
> 详见 [NOTICE](NOTICE)。

---

## 下载安装（macOS / Apple Silicon）

到 [Releases](https://github.com/QianXiquq/haruyuki-desktop/releases) 下载最新的
`haruyuki-desktop-x.y.z-arm64.dmg`，打开后把 `haruyuki-desktop.app` 拖进「应用程序」。

> ⚠️ **只提供 arm64**（Apple Silicon）。Intel 机器**没有验证过**。
>
> ⚠️ **应用未签名、未公证**，所以首次打开 macOS 会拦下它。**放行办法（任选其一）**：
> - 在「应用程序」里 **右键点图标 → 打开 → 再点「打开」**（只需一次）
> - `系统设置 → 隐私与安全性`，底部会出现被拦提示 → 点「仍要打开」
> - 终端：`xattr -dr com.apple.quarantine /Applications/haruyuki-desktop.app`
>
> ⚠️ **haruyuki 运行时不随包分发** —— 仍要按下面的「环境要求」单独安装。
> 装好后应用会自动找到它（会搜索 `PATH` 与常见安装目录）。
>
> ⚠️ 目前用的是 **Electron 默认图标**（还没做自己的图标）。

## 它能做什么

目标是在日常使用上对齐 TUI，除了协议本身不暴露的那些部分。

| 方面 | 这个客户端能做什么 |
|---|---|
| 会话 | 列表、打开、改名、**删除**（需逐字输入确认）、按标题搜索 |
| 消息 | 流式输出、推理单独展示、工具调用与结果、审批弹窗 |
| Agent | 列表、切换、新建 |
| 模型 | 列表与切换，含推理档位 |
| 工作目录 | 展示与修改，按会话独立 |
| 记忆（MemFS） | 浏览、编辑、删除记忆文件，查看提交历史 |
| 召回（recall） | 索引状态、构建索引、试搜、全部十项设置、重启服务端 |
| 用量 | 每轮 token，以及该会话的累计 —— **含从磁盘读出的历史** |

这里的东西都是**量出来的，不是猜的**：`scripts/` 下有 15 个自测脚本，断言真正重要的行为，
其中一些正是过去**会静默失败**的地方。

## 环境要求

- **macOS** —— 在 macOS（Apple Silicon）上开发和验证。除了打包之外代码里没有 macOS 特有的东西，
  但**没有在别的平台上试过**。
- **[bun](https://bun.sh)** —— 构建工具链与自测脚本用它。
- **Node.js 20+** —— 只在你不通过 bun 跑自测脚本时需要。
- **haruyuki 0.2.0 或更新**，需要单独安装（见下）。app-server 协议版本在 0.1.3 与 0.2.0
  都是 `1`，所以旧版运行时也能连上 —— 但本客户端是**针对 0.2.0 开发和验证**的；
  底部状态条会显示运行时版本，你能一眼看出自己连的是哪个。

### 安装 haruyuki

```bash
npm install -g haruyuki
```

## 让本客户端找到 haruyuki

应用需要知道怎么启动 haruyuki 运行时。解析顺序如下，**先匹配到的胜出**：

| 顺序 | 来源 | 含义 |
|---|---|---|
| 1 | `HARUYUKI_SERVER_CMD` | 完整命令行，**必须自带 `server` 子命令** |
| 2 | `HARUYUKI_BIN` | 可执行文件路径，或 `.js` 入口路径 |
| 3 | `HARUYUKI_REPO` | haruyuki 源码检出目录，取其构建产物 `<dir>/haruyuki.js` |
| 4 | `~/haruyuki-upstream` | 参考检出目录（该构建产物存在时） |
| 5 | `PATH` + 常见安装目录 | 全局安装的 `haruyuki` |
| 6 | — | `<项目>/node_modules/.bin/haruyuki`（存在时） |

**全局 `npm install -g haruyuki` 会被自动找到。** 第 5 步同时搜索 `PATH`
**和**一组常见安装目录 —— `/opt/homebrew/bin`、`/usr/local/bin`、`~/.bun/bin`、
`~/.local/bin`、`~/.npm-global/bin`、`~/.volta/bin`。之所以不只靠 `PATH`：
**从 Finder 或 Dock 启动的应用，`PATH` 通常只有 `/usr/bin:/bin:/usr/sbin:/sbin`**，
不主动搜那几处就永远看不到 Homebrew 或 npm 全局装的 haruyuki。

如果你装了多个 haruyuki、想指定其中一个，就设 `HARUYUKI_REPO` 或 `HARUYUKI_BIN` ——
靠前的步骤优先。

从 haruyuki 源码检出构建一次，然后指向那个目录：

```bash
git clone https://github.com/TZYLT/haruyuki.git ~/haruyuki
cd ~/haruyuki && npm install && npm run build
export HARUYUKI_REPO="$HOME/haruyuki"
```

`scripts/setup-server.sh` 可以把「克隆 + 构建到 `~/haruyuki-upstream`」自动化，不想手敲就用它。

## 构建与运行

```bash
git clone https://github.com/QianXiquq/haruyuki-desktop.git
cd haruyuki-desktop
bun install            # postinstall 会顺便生成 vendor/
bun run build
```

然后用启动脚本起：

```bash
bash scripts/launch.sh          # 源码比 out/ 新时会先自动重建
bash scripts/launch.sh --build  # 强制重建
```

或者在 Finder 里双击 **`启动 haruyuki-desktop.command`**。

启动脚本替你处理了三件**手工很容易弄错**的事：

- **`bun` 常常只在 `~/.bun/bin`**，不在默认 `PATH` 里。
- **`ELECTRON_RUN_AS_NODE` 必须清掉**。它为 `1` 时 Electron 会以 Node 身份运行，
  应用启动即崩，报 `does not provide an export named 'BrowserWindow'`。
- **agent 的工作目录是显式设置的**。否则服务端会继承「你启动时所在的目录」——
  从项目目录启动，就等于把**这个仓库本身**（连同它的 git 历史与 `node_modules`）
  交给 agent 当工作区。启动脚本把它指向 `$HARUYUKI_WORKDIR`，默认 `~/haruyuki-workspace`。

不用启动脚本的话：

```bash
./node_modules/electron/dist/Electron.app/Contents/MacOS/Electron .
```

## 自测

```bash
bun run typecheck

bun run check:integration   # 连接 → 启动 runtime → 发消息
bun run check:approval      # 审批往返、工具执行、中断
bun run check:conversations # 历史顺序、分类、recall 注入块剥离
bun run check:recall        # recall CLI、解析器、防雪崩护栏
bun run check:usage         # token 统计（纯函数）
bun run check:cwd           # 工作目录，含隔离断言
bun run check:model         # 模型目录结构与切换
bun run check:rename        # 会话改名与服务端标题搜索
bun run check:agent         # agent 列表与新建
bun run check:memory        # MemFS 读写、frontmatter 规则、清理
bun run check:search        # 标题搜索与 recall 试搜
bun run check:perf          # 流式负载：事件数不得随文本长度增长
bun run check:delete        # 会话删除、路径逃逸、历史 token
bun run check:resolve       # haruyuki 运行时的定位方式（不需要服务端）
bun run check:layout        # 布局量测（需要 Electron，见下方说明）
```

其中一些会**产生真实数据** —— `check:agent` 会建一个 agent 再删，
`check:memory` 会写一个记忆文件再删，`check:delete` 会建一个会话再删，
`check:recall` 会改设置再还原。它们都**断言自己清理干净** ——
留下垃圾比失败更糟。

> `check:layout` 必须**通过应用自己的入口**启动
> （`HARUYUKI_APP_ENTRY=out/main/index.mjs`）。直接开一个裸窗口加载渲染进程是拿不到会话数据的，
> 那样**每条断言都会空洞地通过**。

## 架构

```
src/main/       Node 侧。持有 WebSocket、文件系统与子进程。
  app-server.ts     协议客户端；也放塑形协议数据的纯函数
  server-process.ts 启动运行时，以及工作目录的解析
  conversation-store.ts  直接读写/删除本地会话存储
  recall.ts         haruyuki recall 子命令
  ipc.ts            白名单化的 IPC 表面
src/preload/    contextBridge 桥；渲染进程只能拿到这里给的东西，多一分都没有
src/renderer/   React 界面
src/shared/     两侧共用的类型与纯函数
vendor/haruyuki/ 生成出来的类型声明（见 NOTICE）
```

两条约束决定了整体设计：

- **渲染进程从不直接和服务端通信。** 它没有 Node 权限、也没有 socket，一切都走白名单化的 IPC；
  而服务端本身会拒绝任何带 `Origin` 头的 WebSocket 握手，所以就算允许，浏览器侧连接也连不上。
- **流式增量在主进程做批处理。** 服务端**逐 token** 推 delta，逐个转发时一轮短回复就要
  ~242 次 IPC 事件，叠加「每次事件全量重渲染」，直接把一个 CPU 核吃满。现在增量按
  **每 ~50ms 合并成一个事件**。这条一旦退化，`check:perf` 会失败。

## 已知限制

- **未签名、未公证。** 目前**没有发布预编译安装包**，需要自己从源码构建。
  如果你自己打包，macOS Gatekeeper 会拦下未签名的应用，需要手动放行。
- **不显示成本。** 服务端不通过协议下发成本。磁盘记录里其实有，但**刻意不展示** —— 只显示 token。
- TUI 有些功能协议没有暴露，本客户端**不会假装支持**。

## 参与贡献

这个仓库是公开的，所以有一个 `pre-commit` 钩子守着三件「一旦推上去就很难挽回」的事：

1. **提交邮箱不是 GitHub noreply。** 邮箱会被**永久**写进 commit 对象，而且能被爬取；
   事后清理需要**改写全部历史**。
2. **本机绝对路径**（`/Users/<name>/…`）泄漏进被跟踪文件。
3. **暂存差异里出现密钥形态的字符串。**

Git **不会自动启用仓库钩子**，所以每台机器要开一次：

```bash
git config core.hooksPath .githooks
```

钩子只看你**暂存的那几行**，所以改了一个本来就合法的文件的一行并不会让它整体报错。
它是**最后一道防线，不是安全扫描器**：它不读历史、判断不出某段文字是否私密，
而且 `git commit --no-verify` 可以绕过它。

## 许可

Apache License 2.0 —— 见 [LICENSE](LICENSE)。

第三方归属见 [NOTICE](NOTICE) 与 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。
**haruyuki 运行时不随本仓库分发**，请单独安装。
