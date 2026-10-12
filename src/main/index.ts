import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow } from "electron";
import WebSocket from "ws";
import { AppServerBridge } from "./app-server";
import { registerIpcHandlers } from "./ipc";
import { startServer, type StartedServer } from "./server-process";
import type { HaruyukiEvent, ServerStatus } from "@/shared/ipc-contract";

/**
 * WS 连接只存在于主进程。
 *
 * 原因（服务端硬约束，见 src/websocket/app-server.ts:270-279 与 341-351）：
 * app-server 拒绝任何带 Origin 头的请求，并要求在 WebSocket upgrade 时用
 * Authorization 头鉴权 —— 浏览器/渲染进程两件事都做不到。
 * 主进程用 Node 的 ws 默认不发 Origin，因此可零服务端改动直连 loopback。
 */
/** ESM 下没有 currentDir，必须自行推导。 */
const currentDir = dirname(fileURLToPath(import.meta.url));

const CHANNEL_EVENT = "haruyuki:event";
const CHANNEL_STATUS = "haruyuki:status";

let mainWindow: BrowserWindow | null = null;
let server: StartedServer | null = null;
let bridge: AppServerBridge | null = null;
let status: ServerStatus = { state: "starting" };

function pushEvent(event: HaruyukiEvent): void {
  // ⚠️ 状态事件必须**同时**更新主进程的 `status`，不能只发给渲染进程。
  //
  // 原先这里只发 `haruyuki:event`，于是 `haruyuki:getStatus` 永远返回
  // `bootAppServer` 里 setStatus 的那份**残缺**状态（没有 haruyukiVersion / backend）
  // —— 而渲染进程挂载时是**先调 getStatus() 再订阅事件**的，冷挂载就会拿到残缺版。
  // 实测到的现象：顶栏只显示 `protocol v1`，分辨不出对面是 0.1.3 还是 0.2.0。
  if (event.kind === "status") {
    setStatus(event.status);
    return;
  }
  mainWindow?.webContents.send(CHANNEL_EVENT, event);
}

function setStatus(next: ServerStatus): void {
  status = next;
  mainWindow?.webContents.send(CHANNEL_STATUS, next);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    show: false,
    title: "Haruyuki Desktop",
    backgroundColor: "#14161a",
    webPreferences: {
      preload: join(currentDir, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => mainWindow?.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) {
    void mainWindow.loadURL(devUrl);
  } else {
    void mainWindow.loadFile(join(currentDir, "../renderer/index.html"));
  }
}

async function bootAppServer(): Promise<void> {
  try {
    setStatus({ state: "starting" });
    const started = await startServer();
    server = started;

    bridge = new AppServerBridge(pushEvent);
    const protocolVersion = await bridge.connect(started.wsUrl, WebSocket);

    // ⚠️ 这里**不要**再 setStatus 一次。
    //
    // `bridge.connect()` 已经发出了完整的 connected 状态（含 haruyukiVersion /
    // backend），而这里如果再 setStatus 一份"精简版"，就会把刚存下的完整状态**覆盖掉**。
    // 实测症状：主进程里状态是对的，但 `haruyuki:getStatus` 返回残缺版，顶栏因此
    // 只显示 `protocol v1`，分辨不出对面是 0.1.3 还是 0.2.0。
    console.log(`[haruyuki-desktop] connected ${started.wsUrl} protocol=v${protocolVersion}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus({ state: "error", error: message });
    console.error(`[haruyuki-desktop] boot failed: ${message}`);
    pushEvent({ kind: "error", message });
  }
}

function shutdown(): void {
  bridge?.close();
  bridge = null;
  server?.stop();
  server = null;
}

/** 防止连点两次导致两个服务端进程并存。 */
let restarting = false;

/**
 * 重启 app-server。
 *
 * 存在的理由不只是"方便"：recall 的设置经 `settingsManager` **启动时读一次就缓存
 * 在内存里**（`getSettings()` 直接 `return { ...this.settings }`），所以**改设置
 * 对已经在跑的服务端无效** —— 必须换一个进程才生效。
 *
 * 顺带修掉一个既有缺口：窗口 reload 之后主进程原本既不重连也不重启，状态会永久停在
 * "正在启动 app-server…"。现在有了这个动作，界面就有了自救手段。
 *
 * ⚠️ 重启会丢当前的 runtime scope（要重新 `runtime_start`），但**会话历史不丢**
 * —— 那些都在磁盘上，渲染进程重启后会按"上次会话"重新恢复。
 */
async function restartAppServer(): Promise<void> {
  if (restarting) throw new Error("服务端正在重启中");
  restarting = true;
  try {
    shutdown();
    // 让出事件循环：`server.stop()` 只是发 SIGTERM，紧接着 spawn 新进程的话，
    // 旧进程可能还没来得及释放它占用的资源。
    await new Promise((resolve) => setTimeout(resolve, 300));
    await bootAppServer();
    if (status.state === "error") {
      throw new Error(status.error ?? "重启后未能连接");
    }
  } finally {
    restarting = false;
  }
}

void app.whenReady().then(() => {
  // IPC 必须在窗口加载前注册：渲染进程一挂载就会调用 listAgents，
  // 而 app-server 连接需要几秒，晚注册会报 "No handler registered"。
  registerIpcHandlers({
    getStatus: () => status,
    getBridge: () => {
      if (!bridge) throw new Error("app-server 尚未连接，请稍候");
      return bridge;
    },
    restartAppServer,
  });

  createWindow();
  void bootAppServer();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  shutdown();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", shutdown);
