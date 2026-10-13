import { spawn, type ChildProcess } from "node:child_process";
import { accessSync, constants, existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * 解析要启动的 haruyuki 可执行文件。
 *
 * 优先顺序：
 *   1. HARUYUKI_SERVER_CMD —— 完整命令行，空格分隔，**须自带 `server` 子命令**
 *      （最高优先级，便于测试与自定义构建）
 *   2. HARUYUKI_BIN       —— 可执行文件或 .js 路径
 *   3. HARUYUKI_REPO      —— 源码仓目录，取其构建产物 `<dir>/haruyuki.js`
 *   4. 上游参考仓的构建产物（开发期默认；仅当文件确实存在）
 *   5. **PATH 与常见安装目录里的 `haruyuki`**（全局安装的那一份）
 *   6. 自带 node_modules/.bin/haruyuki
 *
 * 关于第 4 条：开发期默认指向 **上游 TZYLT 的 0.2.0 参考仓**，
 * 而不是任何 fork。`haruyuki.js` 是 gitignore 的构建产物，所以这个文件存不存在
 * 直接决定开发期能不能跑起来；不存在时会自然落到第 5 条。
 */
const UPSTREAM_REFERENCE_REPO = join(homedir(), "haruyuki-upstream");

function builtArtifactOf(repoDir: string): string {
  return join(repoDir, "haruyuki.js");
}

export interface ServerCommand {
  command: string;
  args: string[];
}

/** 开发期默认的服务端构建产物；都不存在时返回 null。 */
export function defaultServerBuild(): string | null {
  const fromEnv = process.env.HARUYUKI_REPO;
  if (fromEnv && fromEnv.trim()) {
    const artifact = builtArtifactOf(fromEnv.trim());
    if (existsSync(artifact)) return artifact;
  }
  const upstream = builtArtifactOf(UPSTREAM_REFERENCE_REPO);
  return existsSync(upstream) ? upstream : null;
}

export function resolveServerCommand(): ServerCommand {
  const launcher = resolveHaruyukiLauncher();
  return { command: launcher.command, args: [...launcher.args, "server"] };
}

/**
 * 解析"如何调用 haruyuki 本体"，**不含子命令**。
 *
 * `resolveServerCommand()` 与 recall 的 spawn（`src/main/recall.ts`）共用这一份 ——
 * 否则会出现"能连上服务端、却找不到同一个二进制去跑 `haruyuki recall`"的割裂。
 *
 * ⚠️ 返回的 `args` 是**前缀**（例如 `["/path/haruyuki.js"]`），调用方自己接子命令，
 * 即 `[...args, "recall", "status"]`。
 */
export function resolveHaruyukiLauncher(): ServerCommand {
  const full = process.env.HARUYUKI_SERVER_CMD;
  if (full && full.trim()) {
    const [command, ...rest] = full.trim().split(/\s+/);
    // HARUYUKI_SERVER_CMD 是**完整命令行**（含 `server` 子命令），
    // 这里要把子命令剥掉，只留"怎么启动 haruyuki"这一层。
    const isServerTail = rest[rest.length - 1] === "server";
    return { command: command as string, args: isServerTail ? rest.slice(0, -1) : rest };
  }

  const explicit = process.env.HARUYUKI_BIN;
  if (explicit && explicit.trim()) {
    return /\.(js|cjs|mjs)$/.test(explicit)
      ? { command: process.execPath, args: [explicit] }
      : { command: explicit, args: [] };
  }

  const devBuild = defaultServerBuild();
  if (devBuild) {
    return { command: process.execPath, args: [devBuild] };
  }

  // 全局安装（`npm install -g haruyuki`）的查找。
  //
  // ⚠️ **不能只靠 `process.env.PATH`**：从 Finder / Dock 启动的应用，
  // PATH 往往只有 `/usr/bin:/bin:/usr/sbin:/sbin`，看不到 `/opt/homebrew/bin`
  // 或 `/usr/local/bin`。所以这里**同时**搜 PATH 与一组常见安装目录。
  const onPath = findHaruyukiOnPath();
  if (onPath) return { command: onPath, args: [] };

  return {
    command: join(process.cwd(), "node_modules", ".bin", "haruyuki"),
    args: [],
  };
}

/**
 * 在 PATH 与常见安装目录里找 `haruyuki` 可执行文件。
 *
 * 找的是**普通可执行文件**，不是 `.js` —— npm 全局安装会生成一个带 shebang 的
 * shim，直接当命令跑即可。
 *
 * 顺序刻意把用户目录（`~/.bun/bin`、`~/.local/bin`）放在系统目录之后：
 * 系统级安装更可能是用户有意配置的那一份。
 */
export function findHaruyukiOnPath(): string | null {
  const candidates: string[] = [];

  for (const dir of (process.env.PATH ?? "").split(":")) {
    if (dir.trim()) candidates.push(join(dir.trim(), "haruyuki"));
  }

  const home = homedir();
  const wellKnown = [
    "/opt/homebrew/bin", // Apple Silicon Homebrew
    "/usr/local/bin", // Intel Homebrew / npm 默认前缀
    "/usr/bin",
    join(home, ".bun", "bin"),
    join(home, ".local", "bin"),
    join(home, ".npm-global", "bin"),
    // nvm / volta 这类版本管理器：只取"当前"软链，不遍历所有版本
    join(home, ".volta", "bin"),
  ];
  for (const dir of wellKnown) candidates.push(join(dir, "haruyuki"));

  for (const candidate of candidates) {
    try {
      // 必须同时是文件且有执行位 —— 只判 existsSync 会把一个同名**目录**当成命令
      if (existsSync(candidate) && statSync(candidate).isFile()) {
        accessSync(candidate, constants.X_OK);
        return candidate;
      }
    } catch {
      // 没权限 / 不存在：继续找下一个
    }
  }
  return null;
}

export interface StartedServer {
  child: ChildProcess;
  wsUrl: string;
  stop(): void;
}

/**
 * 启动本地 app-server 并解析它实际监听的 WebSocket URL。
 *
 * 传裸 `--listen`，服务端会自己挑一个可用的 loopback 端口，避免端口冲突；
 * 真实 URL 从 stdout 的 `WebSocket: ws://…` 行解析。
 */
export interface StartServerOptions {
  /**
   * 服务端进程的工作目录 —— **它决定了 agent 的 `boot_working_directory`**。
   *
   * ⚠️ 必须显式设置，不能让 spawn 继承调用者的 cwd。上游的兜底值是
   * `process.cwd()`（`protocol-outbound.ts`），所以**在哪个目录启动应用，agent 的
   * 工作区就是哪个目录**。实测的后果：从 `~/haruyuki-desktop` 启动时，agent 的
   * 工作区变成了**这个项目本身** —— 它能翻到本仓库的 git 历史、`node_modules`
   * （1.2GB），于是"打个招呼"就变成去探索代码库、烧掉大量 token。
   *
   * 默认取 `$HARUYUKI_WORKDIR`，否则**用户主目录**（一个不会误导 agent 的中性位置）。
   * 每个会话仍可在界面上单独覆盖（`WorkingDirectory` 组件 → `change_device_state`）。
   */
  cwd?: string;
  /** 等待"监听地址"上报的上限。 */
  timeoutMs?: number;
  /**
   * 覆盖要启动的命令。自测脚本用它来**钉死**测的是哪一个构建产物，
   * 避免"以为测了 0.2.0、实际测的是旧 checkout"。
   */
  command?: ServerCommand;
}

/**
 * 服务端进程的工作目录 = agent 的初始工作区。
 *
 * 顺序：`$HARUYUKI_WORKDIR` → 用户主目录。
 * **绝不**回退到 `process.cwd()`：那正是"agent 把应用自己的仓库当成工作区"的原因。
 */
export function defaultWorkingDirectory(): string {
  const fromEnv = process.env.HARUYUKI_WORKDIR?.trim();
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  return homedir();
}

export function startServer(
  timeoutMsOrOptions: number | StartServerOptions = 20_000,
): Promise<StartedServer> {
  const options: StartServerOptions =
    typeof timeoutMsOrOptions === "number" ? { timeoutMs: timeoutMsOrOptions } : timeoutMsOrOptions;
  const timeoutMs = options.timeoutMs ?? 20_000;
  const { command, args } = options.command ?? resolveServerCommand();
  const child = spawn(command, [...args, "--listen"], {
    cwd: options.cwd ?? defaultWorkingDirectory(),
    stdio: ["ignore", "pipe", "pipe"],
    // ⚠️ 在 Electron 里 process.execPath 是 **Electron 自己**，不是 node。
    // 设置 ELECTRON_RUN_AS_NODE=1 才能让它以 Node 身份运行 haruyuki.js。
    // 对真正的 node 可执行文件而言这个变量无害。
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
  });

  return new Promise<StartedServer>((resolve, reject) => {
    /** 把服务端输出附到错误里 —— 否则失败只有一个退出码，无法诊断。 */
    const tail = (): string => {
      const trimmed = buffer.trim();
      if (!trimmed) return "(无输出)";
      return trimmed.length > 900 ? `…${trimmed.slice(-900)}` : trimmed;
    };

    let settled = false;
    let buffer = "";

    const stop = (): void => {
      if (!child.killed) child.kill("SIGTERM");
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      stop();
      reject(new Error(`haruyuki server 在 ${timeoutMs}ms 内没有报告监听地址。输出：\n${tail()}`));
    }, timeoutMs);

    const onData = (chunk: Buffer): void => {
      buffer += chunk.toString();
      const match = /WebSocket:\s*(ws:\/\/\S+)/.exec(buffer);
      if (match && !settled) {
        settled = true;
        clearTimeout(timer);
        resolve({ child, wsUrl: match[1] as string, stop });
      }
    };

    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });

    child.on("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`haruyuki server 提前退出（code=${code}）。输出：\n${tail()}`));
    });
  });
}
