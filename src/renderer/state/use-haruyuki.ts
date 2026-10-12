import { useCallback, useEffect, useState } from "react";
import type {
  AgentSummary,
  ChatItem,
  ConversationSummary,
  HaruyukiApi,
  PermissionMode,
  RecallSettingValue,
  RecallStatusSummary,
  RuntimeScope,
  ServerStatus,
} from "@/shared/ipc-contract";
import { parseRecallStatus } from "@/shared/ipc-contract";

declare global {
  interface Window {
    haruyuki: HaruyukiApi;
  }
}

export interface PendingApproval {
  requestId: string;
  toolName: string;
  input: unknown;
}

/**
 * 记住"上次用的是哪个会话"，重启应用后据此恢复。
 *
 * 只记 id、不记内容：内容的权威来源永远是服务端的 `conversation_messages_list`，
 * 本地不复制一份，避免两边不一致。
 */
const LAST_CONVERSATION_KEY = "haruyuki:last-conversation-id";

function readStoredConversationId(): string | null {
  try {
    return window.localStorage.getItem(LAST_CONVERSATION_KEY);
  } catch {
    // 隐私模式等场景下 localStorage 可能直接抛异常，恢复不了就退回"最近一个会话"。
    return null;
  }
}

function storeConversationId(conversationId: string | null): void {
  try {
    if (conversationId) window.localStorage.setItem(LAST_CONVERSATION_KEY, conversationId);
    else window.localStorage.removeItem(LAST_CONVERSATION_KEY);
  } catch {
    /* 存不了就算了，不影响本次使用 */
  }
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function appendText(items: ChatItem[], kind: "assistant" | "reasoning", text: string): ChatItem[] {
  if (!text) return items;
  const last = items[items.length - 1];
  if (last && last.kind === kind) {
    const merged: ChatItem = { ...last, text: last.text + text };
    return [...items.slice(0, -1), merged];
  }
  return [...items, { id: uid(), kind, text }];
}

/**
 * 服务端按 `created_at` 倒序返回会话，但"最近用过"才是用户心里的顺序。
 * 没有 `last_message_at` 的（刚建出来还没说话）退回到 `created_at`。
 */
export function sortConversationsByRecency(
  conversations: ConversationSummary[],
): ConversationSummary[] {
  const at = (c: ConversationSummary): number =>
    Date.parse(c.lastMessageAt ?? c.updatedAt ?? c.createdAt ?? "") || 0;
  return [...conversations].sort((a, b) => at(b) - at(a));
}

export function useHaruyuki() {
  const [status, setStatus] = useState<ServerStatus>({ state: "starting" });
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [busy, setBusy] = useState(false);
  const [runtime, setRuntime] = useState<RuntimeScope | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  /** 当前会话 id 的非渲染镜像，供回调读取（避免闭包读到旧值）。 */
  const [activeIdRef] = useState<{ current: string | null }>({ current: null });
  /** 当前选中的 agent id，同上。 */
  const [agentIdRef] = useState<{ current: string | null }>({ current: null });
  const [recall, setRecall] = useState<RecallStatusSummary | null>(null);
  const [recallBusy, setRecallBusy] = useState(false);
  /** 有设置改动尚未通过重启生效 —— 界面要一直挂着提示，直到重启完成。 */
  const [recallDirty, setRecallDirty] = useState(false);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    const offStatus = window.haruyuki.onStatus(setStatus);
    const offEvent = window.haruyuki.onEvent((event) => {
      switch (event.kind) {
        case "user_message":
          setItems((prev) => [...prev, { id: uid(), kind: "user", text: event.text }]);
          setBusy(true);
          return;
        case "assistant_delta":
          setItems((prev) => appendText(prev, "assistant", event.text));
          return;
        case "reasoning_delta":
          setItems((prev) => appendText(prev, "reasoning", event.text));
          return;
        case "tool_call":
          setItems((prev) => [
            ...prev,
            { id: event.id, kind: "tool_call", name: event.name, input: event.input, done: false },
          ]);
          return;
        case "tool_return":
          setItems((prev) =>
            prev.map((item) =>
              item.kind === "tool_call" && item.id === event.id
                ? { ...item, done: true, output: event.output }
                : item,
            ),
          );
          return;
        case "approval_request":
          setApprovals((prev) => [
            ...prev.filter((a) => a.requestId !== event.requestId),
            { requestId: event.requestId, toolName: event.toolName, input: event.input },
          ]);
          return;
        case "approval_resolved":
          setApprovals((prev) => prev.filter((a) => a.requestId !== event.requestId));
          return;
        case "turn_finished":
          setBusy(false);
          setApprovals([]);
          // 回合结束后该会话的 last_message_at / 消息条数都变了，列表要重排，
          // 否则侧栏里的时间是旧的、"N 条"也对不上。
          // 直接用 window.haruyuki 而不是 refreshConversations：后者定义在下面，
          // 而且这里不需要它的 setState 之外的任何行为。
          if (agentIdRef.current) {
            void window.haruyuki
              .listConversations(agentIdRef.current)
              .then((listed) => setConversations(sortConversationsByRecency(listed)))
              .catch(() => {
                /* 列表刷新失败不该冒泡成未捕获的 rejection */
              });
          }
          return;
        case "notice":
          // 服务端的信息性提示（0.2.0 的 recall 降级/超时走这条）。不是错误，但要可见。
          setItems((prev) => [...prev, { id: uid(), kind: "notice", text: event.text }]);
          return;
        case "error":
          setItems((prev) => [
            ...prev,
            { id: uid(), kind: "notice", text: `错误：${event.message}`, level: "error" },
          ]);
          setBusy(false);
          return;
        default:
          return;
      }
    });
    return () => {
      offStatus();
      offEvent();
    };
    // agentIdRef 是惰性初始化的稳定对象（setAgentIdRef 从不调用），不会触发重订阅。
  }, [agentIdRef]);

  /** 统一把失败暴露到界面上，绝不静默吞掉。 */
  const guard = useCallback(async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setItems((prev) => [
        ...prev,
        { id: uid(), kind: "notice", text: `${label}失败：${message}`, level: "error" },
      ]);
    }
  }, []);

  const notice = useCallback((text: string, level: "info" | "error" = "info") => {
    setItems((prev) => [...prev, { id: uid(), kind: "notice", text, level }]);
  }, []);

  const refreshAgents = useCallback(async () => {
    try {
      setAgents(await window.haruyuki.listAgents());
    } catch (error) {
      setItems((prev) => [
        ...prev,
        { id: uid(), kind: "notice", text: `无法列出 agent：${String(error)}`, level: "error" },
      ]);
    }
  }, []);

  /**
   * 拉会话列表。`agentId` 为空表示"全部 agent 的会话"。
   *
   * ⚠️ 这里**必须按 agentId 过滤**：会话是挂在 agent 上的，列出别的 agent 的会话
   * 点进去只会得到一个 context 不匹配的 runtime，所以宁可不显示。
   */
  const refreshConversations = useCallback(async (agentId?: string): Promise<ConversationSummary[]> => {
    const listed = sortConversationsByRecency(await window.haruyuki.listConversations(agentId));
    setConversations(listed);
    return listed;
  }, []);

  /**
   * 拉取并渲染某个会话的历史消息。
   *
   * 恢复会话必须显式做这一步：服务端 `runtime_start { conversation_id }` 只重放
   * loop/queue 状态，**不重放历史消息**（实测）。
   */
  const fetchHistory = useCallback(async (conversationId: string): Promise<void> => {
    setLoadingHistory(true);
    try {
      const history = await window.haruyuki.loadConversation(conversationId);
      setItems(history.items);
      if (history.hasMore) {
        setItems([
          { id: uid(), kind: "notice", text: "更早的历史消息未显示（本页只加载最近一批）。" },
          ...history.items,
        ]);
      }
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  /** 手动重新拉当前会话的历史（界面上的"重新加载历史"按钮）。 */
  const reloadHistory = useCallback(async () => {
    const conversationId = activeIdRef.current;
    if (!conversationId) return;
    await guard("重新加载历史", () => fetchHistory(conversationId));
  }, [activeIdRef, fetchHistory, guard]);

  /**
   * 读 recall 状态（只读）。
   *
   * recall 在协议层没有任何命令，所以这里走 `haruyuki recall status` 子进程。
   * 失败**不弹错** —— recall 不是核心功能，服务端没装好时不该让界面炸掉；
   * 只在面板上留一行说明。
   */
  const refreshRecall = useCallback(async () => {
    try {
      const result = await window.haruyuki.recallStatus();
      setRecall(result.ok ? parseRecallStatus(result.output) : null);
    } catch {
      setRecall(null);
    }
  }, []);

  /**
   * 构建召回索引（**写操作**，只由用户显式点击触发）。
   *
   * 为什么必须让用户能做这件事：索引为空时 recall 返回 `no-match`，走的是**正常路径**
   * 而**不是** degraded，因此**不发任何通知** —— 表现为 agent 莫名答不上以前聊过的事，
   * 没有任何线索。上游唯一的自救办法 `haruyuki recall build` 是 TUI 命令，
   * GUI 用户没有它就永远好不了。
   */
  const buildRecallIndex = useCallback(async () => {
    if (recallBusy) return;
    setRecallBusy(true);
    try {
      const result = await window.haruyuki.recallBuild();
      // 结果原样落进对话流：上游的文案比我们转述的更有用（含索引了多少会话）。
      if (result.ok) {
        notice(`召回索引已构建：${result.output.split("\n")[0] ?? ""}`);
      } else {
        notice(`构建召回索引失败：${result.error ?? "未知原因"}`, "error");
      }
      const after = await window.haruyuki.recallStatus();
      setRecall(after.ok ? parseRecallStatus(after.output) : null);
    } catch (error) {
      notice(`构建召回索引失败：${String(error)}`, "error");
    } finally {
      setRecallBusy(false);
    }
  }, [notice, recallBusy]);

  /**
   * 改一个 recall 设置。
   *
   * ⚠️ **改完不会立即生效**：`settingsManager` 在进程启动时读一次并缓存，所以必须
   * 重启 app-server。这里把 `recallDirty` 立起来，界面就一直提示，直到重启完成。
   * **故意不自动重启** —— 重启会打断正在生成的回合。
   */
  const applyRecallSetting = useCallback(
    async (setting: RecallSettingValue) => {
      if (recallBusy) return;
      setRecallBusy(true);
      try {
        const result = await window.haruyuki.recallSet(setting);
        if (result.ok) {
          setRecallDirty(true);
          const after = await window.haruyuki.recallStatus();
          if (after.ok) setRecall(parseRecallStatus(after.output));
        } else {
          notice(`修改 ${setting.knob} 失败：${result.error ?? "未知原因"}`, "error");
        }
      } catch (error) {
        // 主进程的越界校验会在这里抛出（非法值根本不会 spawn 子命令）。
        notice(`修改 ${setting.knob} 失败：${String(error)}`, "error");
      } finally {
        setRecallBusy(false);
      }
    },
    [notice, recallBusy],
  );

  /**
   * 重启 app-server —— 让 recall 设置生效，也是"reload 后状态卡死"的自救手段。
   *
   * 重启会丢当前 runtime scope，所以完成后要**重新 runtime_start 并把当前会话接回来**
   * （会话历史在磁盘上，不会丢）。
   */
  const restartServer = useCallback(async () => {
    if (restarting) return;
    setRestarting(true);
    try {
      const next = await window.haruyuki.restartServer();
      if (next.state !== "connected") {
        notice(`重启后未能连接：${next.error ?? next.state}`, "error");
        return;
      }
      setRecallDirty(false);
      await refreshAgents();

      const agentId = agentIdRef.current;
      const conversationId = activeIdRef.current;
      if (agentId && conversationId) {
        // 复用同一个 conversation_id 把会话接回来；不传 mode，保持服务端当前模式。
        const scope = await window.haruyuki.startRuntime(agentId, undefined, conversationId);
        setRuntime(scope);
        activeIdRef.current = scope.conversation_id;
        setActiveConversationId(scope.conversation_id);
      }
      await refreshRecall();
      notice("服务端已重启，设置已生效。");
    } catch (error) {
      notice(`重启服务端失败：${String(error)}`, "error");
    } finally {
      setRestarting(false);
    }
  }, [activeIdRef, agentIdRef, notice, refreshAgents, refreshRecall, restarting]);

  /**
   * 唯一的"进入某个会话"入口。
   *
   * `conversationId` 传空 = 新建会话（服务端会分配 `local-conv-N`）。
   * 切换权限模式也走这里：复用同一个 conversation_id，上下文不丢。
   */
  const activateConversation = useCallback(
    async (
      agentId: string,
      mode: PermissionMode | undefined,
      conversationId: string | undefined,
      label: string,
    ) => {
      await guard(label, async () => {
        const scope = await window.haruyuki.startRuntime(agentId, mode, conversationId);
        setRuntime(scope);
        activeIdRef.current = scope.conversation_id;
        agentIdRef.current = scope.agent_id;
        setActiveConversationId(scope.conversation_id);
        storeConversationId(scope.conversation_id);
        setApprovals([]);
        setBusy(false);

        const resuming = Boolean(conversationId) && conversationId === scope.conversation_id;
        if (resuming) {
          await fetchHistory(scope.conversation_id);
        } else {
          // 新会话：清空界面。不做乐观猜测，只信服务端返回的 conversation_id。
          setItems([]);
        }

        // 会话的 last_message_at 会变，列表要在进入后重新排一次。
        try {
          await refreshConversations(agentId);
        } catch {
          /* 列表刷新失败不该打断对话 */
        }
      });
    },
    [activeIdRef, fetchHistory, guard, refreshConversations],
  );

  /** 切换 agent：总是开一个新会话（旧会话仍留在列表里，随时可回去）。 */
  const selectAgent = useCallback(
    async (agentId: string, mode?: PermissionMode) => {
      await activateConversation(agentId, mode, undefined, "连接 agent");
    },
    [activateConversation],
  );

  /** 进入列表里的某个历史会话。 */
  const openConversation = useCallback(
    async (agentId: string, conversationId: string, mode?: PermissionMode) => {
      await activateConversation(agentId, mode, conversationId, "打开会话");
    },
    [activateConversation],
  );

  /** 在同一个 agent 下另起一个新会话。 */
  const newConversation = useCallback(
    async (agentId: string, mode?: PermissionMode) => {
      await activateConversation(agentId, mode, undefined, "新建会话");
    },
    [activateConversation],
  );

  /** 切换权限模式：复用同一个会话，不丢上下文。 */
  const setPermissionMode = useCallback(
    async (agentId: string, mode: PermissionMode, conversationId: string) => {
      await activateConversation(agentId, mode, conversationId, "切换权限模式");
    },
    [activateConversation],
  );

  /**
   * 启动时恢复上次的会话。
   *
   * 优先用 localStorage 里记的 id；没有（例如首次运行、或那个会话已被删）就退回
   * "这个 agent 下最近说过话的那个会话"。都没有才开新会话。
   * 恢复失败（会话已不存在等）会退化成新会话，并且把界面上的错误留痕。
   */
  const restoreLastConversation = useCallback(
    async (agentId: string, mode?: PermissionMode) => {
      const stored = readStoredConversationId();
      let target: string | null = null;
      try {
        const listed = await refreshConversations(agentId);
        if (stored && listed.some((c) => c.id === stored)) {
          target = stored;
        } else {
          target = listed.find((c) => c.messageCount > 0)?.id ?? null;
        }
      } catch (error) {
        notice(`无法列出历史会话：${String(error)}`);
      }

      if (!target) {
        await activateConversation(agentId, mode, undefined, "新建会话");
        return;
      }
      try {
        await activateConversation(agentId, mode, target, "恢复上次会话");
      } catch (error) {
        notice(`恢复会话 ${target} 失败：${String(error)}`);
      }
    },
    [activateConversation, notice, refreshConversations],
  );

  const send = useCallback(
    async (text: string) => {
      await guard("发送消息", async () => {
        await window.haruyuki.sendMessage(text);
      });
    },
    [guard],
  );

  const respond = useCallback(
    async (requestId: string, decision: "allow" | "deny") => {
      await guard("提交审批", async () => {
        await window.haruyuki.respondApproval(requestId, decision);
      });
    },
    [guard],
  );

  const interrupt = useCallback(
    async () => {
      await guard("中断", async () => {
        await window.haruyuki.interrupt();
      });
    },
    [guard],
  );

  return {
    status,
    agents,
    items,
    approvals,
    busy,
    runtime,
    conversations,
    activeConversationId,
    loadingHistory,
    recall,
    recallBusy,
    recallDirty,
    restarting,
    applyRecallSetting,
    restartServer,
    refreshAgents,
    refreshConversations,
    reloadHistory,
    refreshRecall,
    buildRecallIndex,
    selectAgent,
    openConversation,
    newConversation,
    setPermissionMode,
    restoreLastConversation,
    send,
    respond,
    interrupt,
  };
}
