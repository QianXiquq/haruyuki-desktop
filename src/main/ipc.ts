import { ipcMain } from "electron";
import type {
  PermissionMode,
  RecallSettingValue,
  ServerStatus,
} from "@/shared/ipc-contract";
import type { AppServerBridge } from "./app-server";
import { runRecallCommand, toRecallArgs } from "./recall";
import {
  deleteConversation,
  readConversationModel,
  readConversationSummary,
  readConversationTokens,
} from "./conversation-store";

const PERMISSION_MODES: readonly PermissionMode[] = [
  "standard",
  "acceptEdits",
  "unrestricted",
  "strict",
];

export interface IpcDeps {
  getStatus(): ServerStatus;
  getBridge(): AppServerBridge;
  /** 重启 app-server（让 recall 设置生效，或从 reload 后卡死里自救）。 */
  restartAppServer(): Promise<void>;
  /**
   * 当前选中的 agent id。
   *
   * recall 试搜必须带 `--agent`（否则上游报 "needs an active agent"），
   * 而 IPC 层拿不到渲染进程的状态，所以由主进程通过这个取值器提供。
   */
  currentAgentId?: () => string | null;
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

  ipcMain.handle("haruyuki:searchConversations", (_event, agentId: unknown, query: unknown) => {
    if (typeof agentId !== "string" || !agentId) {
      throw new Error("searchConversations 需要 agentId");
    }
    if (typeof query !== "string") throw new Error("searchConversations 的 query 必须是字符串");
    return deps.getBridge().searchConversations(agentId, query);
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
  ipcMain.handle("haruyuki:recallProbe", (_event, query: unknown) => {
    if (typeof query !== "string") throw new Error("recallProbe 的 query 必须是字符串");
    const term = query.trim();
    if (!term) throw new Error("recallProbe 需要非空查询");
    // ⚠️ 查询词若以 `-` 开头，上游的参数解析会把它当**选项**而不是查询词。
    // 我们不做"聪明"的转义，直接拒绝并说清 —— 比让上游给出费解的报错好。
    if (term.startsWith("-")) {
      throw new Error("查询词不能以 `-` 开头（会被上游当成命令行选项）");
    }
    if (term.length > 500) throw new Error("查询词过长（上限 500 字符）");
    return runRecallCommand(["now", term, "--agent", deps.currentAgentId?.() ?? ""]);
  });

  ipcMain.handle("haruyuki:recallSet", (_event, setting: unknown) => {
    // `toRecallArgs` 会在**spawn 之前**校验并抛错 —— 非法值根本到不了上游，
    // 也绝不会写进 ~/.haruyuki/settings.json。
    const args = toRecallArgs(setting as RecallSettingValue);
    return runRecallCommand(args);
  });

  // ---- 记忆（MemFS）----
  //
  // ⚠️ 记忆是**按 agent** 存的，所以每个方法都要 agentId。写操作（write/delete）
  // 由服务端裁定路径是否逃逸记忆根，我们**不自己拼路径**、只透传。
  ipcMain.handle("haruyuki:listMemory", (_event, agentId: unknown) => {
    if (typeof agentId !== "string" || !agentId) throw new Error("listMemory 需要 agentId");
    return deps.getBridge().listMemory(agentId);
  });

  ipcMain.handle("haruyuki:readMemoryFile", (_event, agentId: unknown, path: unknown) => {
    if (typeof agentId !== "string" || !agentId) throw new Error("readMemoryFile 需要 agentId");
    if (typeof path !== "string" || !path) throw new Error("readMemoryFile 需要 path");
    return deps.getBridge().readMemoryFile(agentId, path);
  });

  ipcMain.handle(
    "haruyuki:writeMemoryFile",
    (_event, agentId: unknown, path: unknown, content: unknown, commitMessage: unknown) => {
      if (typeof agentId !== "string" || !agentId) throw new Error("writeMemoryFile 需要 agentId");
      if (typeof path !== "string" || !path) throw new Error("writeMemoryFile 需要 path");
      if (typeof content !== "string") throw new Error("writeMemoryFile 的 content 必须是字符串");
      if (commitMessage !== undefined && typeof commitMessage !== "string") {
        throw new Error("commitMessage 必须是字符串");
      }
      return deps.getBridge().writeMemoryFile(agentId, path, content, commitMessage as string | undefined);
    },
  );

  ipcMain.handle(
    "haruyuki:deleteMemoryFile",
    (_event, agentId: unknown, path: unknown, commitMessage: unknown) => {
      if (typeof agentId !== "string" || !agentId) throw new Error("deleteMemoryFile 需要 agentId");
      if (typeof path !== "string" || !path) throw new Error("deleteMemoryFile 需要 path");
      return deps.getBridge().deleteMemoryFile(agentId, path, commitMessage as string | undefined);
    },
  );

  ipcMain.handle("haruyuki:memoryHistory", (_event, agentId: unknown, path: unknown, limit: unknown) => {
    if (typeof agentId !== "string" || !agentId) throw new Error("memoryHistory 需要 agentId");
    if (path !== undefined && typeof path !== "string") throw new Error("path 必须是字符串");
    if (limit !== undefined && typeof limit !== "number") throw new Error("limit 必须是数字");
    return deps.getBridge().memoryHistory(agentId, path as string | undefined, limit as number | undefined);
  });

  // ---- 删除会话（协议无此命令，直接动本地存储）----
  ipcMain.handle("haruyuki:deleteConversation", (_event, conversationId: unknown) => {
    if (typeof conversationId !== "string" || !conversationId) {
      throw new Error("deleteConversation 需要非空 conversationId");
    }
    const result = deleteConversation(conversationId);
    return { ...result, needsRestart: true };
  });

  ipcMain.handle("haruyuki:conversationTokens", (_event, conversationId: unknown) => {
    if (typeof conversationId !== "string" || !conversationId) {
      throw new Error("conversationTokens 需要非空 conversationId");
    }
    return readConversationTokens(conversationId);
  });

  ipcMain.handle("haruyuki:conversationModel", (_event, conversationId: unknown) => {
    if (typeof conversationId !== "string" || !conversationId) {
      throw new Error("conversationModel 需要非空 conversationId");
    }
    return readConversationModel(conversationId);
  });

  ipcMain.handle("haruyuki:conversationTitle", (_event, conversationId: unknown) => {
    if (typeof conversationId !== "string" || !conversationId) {
      throw new Error("conversationTitle 需要非空 conversationId");
    }
    return readConversationSummary(conversationId);
  });

  // ---- 新建 agent ----
  ipcMain.handle("haruyuki:createAgent", (_event, name: unknown) => {
    if (typeof name !== "string" || !name.trim()) {
      throw new Error("createAgent 需要非空名称");
    }
    return deps.getBridge().createAgent(name);
  });

  // ---- 会话改名（conversation_update { summary }）----
  ipcMain.handle("haruyuki:renameConversation", (_event, conversationId: unknown, summary: unknown) => {
    if (typeof conversationId !== "string" || !conversationId) {
      throw new Error("renameConversation 需要非空的 conversationId");
    }
    if (typeof summary !== "string") {
      throw new Error("renameConversation 的 summary 必须是字符串（空串表示清除自定义标题）");
    }
    return deps.getBridge().renameConversation(conversationId, summary);
  });

  // ---- 模型（list_models / update_model）----
  ipcMain.handle("haruyuki:listModels", () => deps.getBridge().listModels());
  ipcMain.handle("haruyuki:setModel", (_event, modelId: unknown) => {
    // 只接受字符串 id；具体是否为合法模型由服务端裁定（它会回 error）。
    if (typeof modelId !== "string" || !modelId.trim()) {
      throw new Error("setModel 需要非空的 modelId");
    }
    return deps.getBridge().setModel(modelId);
  });

  // ---- 工作目录（cwd）----
  //
  // `setWorkingDirectory` 走 `input` + `payload.cwd`（与权限模式同一条通道），
  // 并在主进程里做三步：先校验目录、等 input_accepted 回执、回读确认。
  ipcMain.handle("haruyuki:getWorkingDirectory", () => deps.getBridge().getWorkingDirectory());

  ipcMain.handle(
    "haruyuki:setWorkingDirectory",
    (_event, path: unknown, applyToAll: unknown) => {
      if (typeof path !== "string" || !path.trim()) {
        throw new Error("setWorkingDirectory 需要非空路径");
      }
      if (applyToAll !== undefined && typeof applyToAll !== "boolean") {
        throw new Error("applyToAll 必须是布尔值");
      }
      return deps.getBridge().setWorkingDirectory(path, applyToAll === true);
    },
  );

  ipcMain.handle("haruyuki:listDirectory", (_event, path: unknown) => {
    if (typeof path !== "string" || !path.trim()) {
      throw new Error("listDirectory 需要非空路径");
    }
    return deps.getBridge().listDirectory(path);
  });

  ipcMain.handle("haruyuki:restartServer", async () => {
    await deps.restartAppServer();
    // 回传重启后的状态，调用方不必再猜一次。
    return deps.getStatus();
  });
}
