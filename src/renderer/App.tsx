import { useEffect, useRef, useState, type FormEvent } from "react";
import { AgentPicker } from "./components/AgentPicker";
import { ApprovalCard } from "./components/ApprovalCard";
import { ConversationList } from "./components/ConversationList";
import { MessageList } from "./components/MessageList";
import { RecallPanel } from "./components/RecallPanel";
import type { PermissionMode } from "@/shared/ipc-contract";
import { useHaruyuki } from "./state/use-haruyuki";

const STATE_LABEL: Record<string, string> = {
  starting: "正在启动 app-server…",
  connected: "已连接",
  disconnected: "连接已断开",
  error: "连接失败",
};

const PERMISSION_LABEL: Record<PermissionMode, string> = {
  standard: "标准（工具需审批）",
  acceptEdits: "自动接受编辑",
  unrestricted: "不受限（全部放行）",
  strict: "严格",
};

export function App() {
  const {
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
    refreshAgents,
    selectAgent,
    openConversation,
    newConversation,
    setPermissionMode,
    restoreLastConversation,
    reloadHistory,
    refreshRecall,
    buildRecallIndex,
    send,
    respond,
    interrupt,
  } = useHaruyuki();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  // 默认用 standard：服务端默认是 unrestricted（一律自动放行），
  // 那样界面上永远不会出现审批卡片。
  const [mode, setMode] = useState<PermissionMode>("standard");

  // 等 app-server 连上再拉 agent 列表，避免在 IPC 就绪前调用。
  useEffect(() => {
    if (status.state !== "connected") return;
    void refreshAgents();
  }, [refreshAgents, status.state]);

  const firstAgentId = agents[0]?.id ?? null;

  /**
   * 进入界面的引导流程，**只跑一次**。
   *
   * 关键点是它必须等 agent 列表出来之后再决定"恢复哪个会话"，而不是一看到
   * 第一个 agent 就 runtime_start —— 后者每次都会新建一个 `local-conv-N`
   * （修复前就是这个行为，会话数因此一路增长）。
   */
  const bootstrapped = useRef(false);
  useEffect(() => {
    if (bootstrapped.current) return;
    if (status.state !== "connected" || firstAgentId === null) return;
    bootstrapped.current = true;
    setSelectedId(firstAgentId);
    void restoreLastConversation(firstAgentId, mode);
    // mode 是引导时的初始权限，刻意不进依赖：中途改权限不该重跑引导。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstAgentId, restoreLastConversation, status.state]);

  async function onSelectAgent(agentId: string): Promise<void> {
    setSelectedId(agentId);
    // 换 agent = 新会话。旧会话仍在左侧列表里，随时可以点回去。
    await selectAgent(agentId, mode);
  }

  async function onSelectConversation(conversationId: string): Promise<void> {
    if (!selectedId || conversationId === activeConversationId) return;
    await openConversation(selectedId, conversationId, mode);
  }

  async function onCreateConversation(): Promise<void> {
    if (!selectedId) return;
    await newConversation(selectedId, mode);
  }

  async function onModeChange(next: PermissionMode): Promise<void> {
    setMode(next);
    // 已经有 runtime 时复用同一个会话，避免切换模式丢掉上下文。
    if (runtime && selectedId) {
      await setPermissionMode(selectedId, next, runtime.conversation_id);
    }
  }

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !runtime || busy) return;
    setDraft("");
    await send(text);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Haruyuki Desktop</div>
        <div className={`status status-${status.state}`}>
          {STATE_LABEL[status.state] ?? status.state}
          {/* 版本必须显示：0.1.3 与 0.2.0 的 protocol_version 都是 1，光看协议版本分辨不出来 */}
          {status.haruyukiVersion ? ` · haruyuki v${status.haruyukiVersion}` : ""}
          {status.protocolVersion ? ` · protocol v${status.protocolVersion}` : ""}
          {status.backend ? ` · ${status.backend}` : ""}
          {status.wsUrl ? ` · ${status.wsUrl}` : ""}
          {status.error ? ` · ${status.error}` : ""}
        </div>
        <div className="mode-picker">
          <label htmlFor="mode-select">权限</label>
          <select
            id="mode-select"
            value={mode}
            disabled={status.state !== "connected"}
            onChange={(event) => void onModeChange(event.target.value as PermissionMode)}
          >
            {(Object.keys(PERMISSION_LABEL) as PermissionMode[]).map((value) => (
              <option key={value} value={value}>
                {PERMISSION_LABEL[value]}
              </option>
            ))}
          </select>
        </div>

        <AgentPicker
          agents={agents}
          selectedId={selectedId}
          onSelect={(id) => void onSelectAgent(id)}
          disabled={status.state !== "connected"}
        />
      </header>

      <div className="body">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          disabled={status.state !== "connected"}
          onSelect={(id) => void onSelectConversation(id)}
          onCreate={() => void onCreateConversation()}
        />

        <aside className="side-panels">
          <RecallPanel
            recall={recall}
            busy={recallBusy}
            status={status}
            onRefresh={() => void refreshRecall()}
            onBuild={() => void buildRecallIndex()}
          />
        </aside>

        <main className="chat">
          <div className="chat-head">
            <span className="chat-conversation">
              {activeConversationId ?? "（未选择会话）"}
            </span>
            <button
              type="button"
              className="reload-history"
              disabled={!activeConversationId || status.state !== "connected"}
              onClick={() => void reloadHistory()}
            >
              重新加载历史
            </button>
          </div>

          <MessageList items={items} loading={loadingHistory} />

          <div className="approval-area">
            {approvals.map((approval) => (
              <ApprovalCard
                key={approval.requestId}
                approval={approval}
                onDecide={(requestId, decision) => void respond(requestId, decision)}
              />
            ))}
          </div>

          <form className="composer" onSubmit={(event) => void onSubmit(event)}>
            <textarea
              value={draft}
              placeholder={runtime ? "输入消息…（Enter 发送，Shift+Enter 换行）" : "先选择一个 agent"}
              disabled={!runtime}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void onSubmit(event);
                }
              }}
            />
            <div className="composer-actions">
              <button type="submit" disabled={!runtime || busy || !draft.trim()}>
                发送
              </button>
              <button
                type="button"
                className="interrupt"
                disabled={!busy}
                onClick={() => void interrupt()}
              >
                中断
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
