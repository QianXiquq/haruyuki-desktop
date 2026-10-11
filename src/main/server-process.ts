import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * 解析要启动的 haruyuki 可执行文件。
 *
 * 优先顺序：
 *   1. HARUYUKI_SERVER_CMD —— 完整命令行，空格分隔（最高优先级，便于测试）
 *   2. HARUYUKI_BIN       —— 可执行文件或 .js 路径
 *   3. 本地源码仓的构建产物（开发期默认；仅当文件确实存在）
 *   4. 自带 node_modules/.bin/haruyuki
 */
const DEV_REPO_BUILD = "/Users/qianxiquq/haruyuki/haruyuki.js";

export interface ServerCommand {
  command: string;
  args: string[];
}

export function resolveServerCommand(): ServerCommand {
  const full = process.env.HARUYUKI_SERVER_CMD;
  if (full && full.trim()) {
    const [command, ...args] = full.trim().split(/\s+/);
    return { command: command as string, args };
  }

  const explicit = process.env.HARUYUKI_BIN;
  if (explicit && explicit.trim()) {
    return /\.(js|cjs|mjs)$/.test(explicit)
      ? { command: process.execPath, args: [explicit, "server"] }
      : { command: explicit, args: ["server"] };
  }

  if (existsSync(DEV_REPO_BUILD)) {
    return { command: process.execPath, args: [DEV_REPO_BUILD, "server"] };
  }

  return {
    command: join(process.cwd(), "node_modules", ".bin", "haruyuki"),
    args: ["server"],
  };
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
export function startServer(timeoutMs = 20_000): Promise<StartedServer> {
  const { command, args } = resolveServerCommand();
  const child = spawn(command, [...args, "--listen"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  return new Promise<StartedServer>((resolve, reject) => {
    let settled = false;
    let buffer = "";

    const stop = (): void => {
      if (!child.killed) child.kill("SIGTERM");
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      stop();
      reject(new Error(`haruyuki server 在 ${timeoutMs}ms 内没有报告监听地址`));
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
      reject(new Error(`haruyuki server 提前退出，code=${code}`));
    });
  });
}
