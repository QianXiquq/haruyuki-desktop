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


    console.log(`[haruyuki-desktop] connected ${started.wsUrl} protocol=v${protocolVersion}`);
    setStatus({ state: "connected", wsUrl: started.wsUrl, protocolVersion });
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

void app.whenReady().then(() => {
  // IPC 必须在窗口加载前注册：渲染进程一挂载就会调用 listAgents，
  // 而 app-server 连接需要几秒，晚注册会报 "No handler registered"。
  registerIpcHandlers({
    getStatus: () => status,
    getBridge: () => {
      if (!bridge) throw new Error("app-server 尚未连接，请稍候");
      return bridge;
    },
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
