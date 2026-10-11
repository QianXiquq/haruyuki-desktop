import { ipcMain } from "electron";
import type { ServerStatus } from "@/shared/ipc-contract";
import type { AppServerBridge } from "./app-server";

export interface IpcDeps {
  getStatus(): ServerStatus;
  getBridge(): AppServerBridge;
}

/**
 * 注册渲染进程可调用的全部 IPC（白名单）。
 * 渲染进程拿不到 AppServerClient 本体，只能走这几个方法。
 */
export function registerIpcHandlers(deps: IpcDeps): void {
  ipcMain.handle("haruyuki:getStatus", () => deps.getStatus());

  ipcMain.handle("haruyuki:listAgents", () => deps.getBridge().listAgents());

  ipcMain.handle("haruyuki:startRuntime", (_event, agentId: unknown) => {
    if (typeof agentId !== "string" || !agentId) {
      throw new Error("startRuntime 需要非空的 agentId");
    }
    return deps.getBridge().startRuntime(agentId);
  });

  ipcMain.handle("haruyuki:sendMessage", (_event, text: unknown) => {
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("sendMessage 需要非空文本");
    }
    deps.getBridge().sendMessage(text);
  });

  ipcMain.handle("haruyuki:respondApproval", (_event, requestId: unknown, decision: unknown) => {
    if (typeof requestId !== "string" || !requestId) {
      throw new Error("respondApproval 需要 requestId");
    }
    if (decision !== "allow" && decision !== "deny") {
      throw new Error('decision 必须是 "allow" 或 "deny"');
    }
    deps.getBridge().respondApproval(requestId, decision);
  });

  ipcMain.handle("haruyuki:interrupt", () => deps.getBridge().interrupt());
}
