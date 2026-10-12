import { ipcMain } from "electron";
import type { PermissionMode, ServerStatus } from "@/shared/ipc-contract";
import type { AppServerBridge } from "./app-server";
import { runRecallCommand } from "./recall";

const PERMISSION_MODES: readonly PermissionMode[] = [
  "standard",
  "acceptEdits",
  "unrestricted",
  "strict",
];

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

  ipcMain.handle("haruyuki:listConversations", (_event, agentId: unknown) => {
    if (agentId !== undefined && typeof agentId !== "string") {
      throw new Error("listConversations 的 agentId 必须是字符串");
    }
    return deps.getBridge().listConversations(agentId as string | undefined);
  });

  ipcMain.handle("haruyuki:loadConversation", (_event, conversationId: unknown) => {
    if (typeof conversationId !== "string" || !conversationId) {
      throw new Error("loadConversation 需要非空的 conversationId");
    }
    return deps.getBridge().loadConversation(conversationId);
  });

  ipcMain.handle(
    "haruyuki:startRuntime",
    (_event, agentId: unknown, mode: unknown, conversationId: unknown) => {
      if (typeof agentId !== "string" || !agentId) {
        throw new Error("startRuntime 需要非空的 agentId");
      }
      if (mode !== undefined && !PERMISSION_MODES.includes(mode as PermissionMode)) {
        throw new Error(`未知的权限模式：${String(mode)}`);
      }
      if (conversationId !== undefined && typeof conversationId !== "string") {
        throw new Error("conversationId 必须是字符串");
      }
      return deps.getBridge().startRuntime(
        agentId,
        mode as PermissionMode | undefined,
        conversationId as string | undefined,
      );
    },
  );

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

  // ---- recall（走 `haruyuki recall …` CLI 子命令，见 src/main/recall.ts）----
  //
  // ⚠️ 刻意**不暴露任意 argv**，只开这两个动作、参数由主进程写死。
  // 理由与本文件既有的白名单风格一致：参数合法性有两道防线（这里 + 上游 CLI），
  // 而不是把渲染进程传来的数组原样转发。设置类的那 10 个旋钮留到 B1，
  // 届时各建一个**带校验**的方法（数字范围 / 枚举在这里就挡掉）。
  ipcMain.handle("haruyuki:recallStatus", () => runRecallCommand(["status"]));
  ipcMain.handle("haruyuki:recallBuild", () => runRecallCommand(["build"]));
}
