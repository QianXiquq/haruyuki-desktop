import { useEffect, useRef, useState, type FormEvent } from "react";
import { AgentPicker } from "./components/AgentPicker";
import { ApprovalCard } from "./components/ApprovalCard";
import { ConversationList } from "./components/ConversationList";
import { MessageList } from "./components/MessageList";
import { RecallPanel } from "./components/RecallPanel";
import { StatusBar } from "./components/StatusBar";
import { WorkingDirectory } from "./components/WorkingDirectory";
import type { PermissionMode } from "@/shared/ipc-contract";
import { cacheHitRate, formatTokens } from "@/shared/ipc-contract";
import { useHaruyuki } from "./state/use-haruyuki";

const PERMISSION_LABEL: Record<PermissionMode, string> = {
  standard: "标准",
  acceptEdits: "自动接受编辑",
  unrestricted: "不受限",
  strict: "严格",
};

const PERMISSION_HINT: Record<PermissionMode, string> = {
  standard: "工具调用需要审批",
  acceptEdits: "自动接受文件编辑",
  unrestricted: "全部自动放行，不弹审批",
  strict: "最严格",
};

/**
 * 布局（参考 DeepSeek Harness 的界面）：
 *
 * ```
 * ┌─────────────┬──────────────────────────────────────┐
 * │ 新会话       │ 顶栏：标题 · 权限 · agent · 目录      │
 * │ 会话列表     ├──────────────────────────────────────┤
 * │ ──          │ 消息（居中限宽，不画气泡）            │
 * │ 召回         │                                      │
 * │ 用量         │ 输入卡片                             │
 * └─────────────┴──────────────────────────────────────┤
 *                │ 底部状态条                           │
 * ```
 *
 * 关键取舍：**召回与用量从右侧独立面板搬进左侧栏**，于是横向只剩两列，
 * 对话区从约 560px 提到约 780px —— 这是"挤、土"的结构性原因之一。
 * 状态摘要下沉到底部状态条，日常一眼可见而不占版面。
 */
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
    recallDirty,
    restarting,
    usageByItem,
    usageTotals,
    lastUsage,
    cwd,
    applyRecallSetting,
    restartServer,
    refreshAgents,
    selectAgent,
    openConversation,
    newConversation,
    setPermissionMode,
    restoreLastConversation,
    reloadHistory,
    refreshRecall,
    buildRecallIndex,
    changeWorkingDirectory,
    listDirectory,
    send,
    respond,
    interrupt,
  } = useHaruyuki();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<PermissionMode>("standard");

  useEffect(() => {
    if (status.state !== "connected") return;
    void refreshAgents();
  }, [refreshAgents, status.state]);

  const firstAgentId = agents[0]?.id ?? null;

  /** 引导流程只跑一次，且**必须等 agent 列表出来**再决定恢复哪个会话。 */
  const bootstrapped = useRef(false);
  useEffect(() => {
    if (bootstrapped.current) return;
    if (status.state !== "connected" || firstAgentId === null) return;
    bootstrapped.current = true;
    setSelectedId(firstAgentId);
    void restoreLastConversation(firstAgentId, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstAgentId, restoreLastConversation, status.state]);

  async function onSelectAgent(agentId: string): Promise<void> {
    setSelectedId(agentId);
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

  const agentName = agents.find((a) => a.id === selectedId)?.name ?? selectedId ?? "（未选择 agent）";

  // 底部状态条：召回轮数从当前会话的注入痕迹里数出来（协议唯一能拿到的地方）。
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const hit = lastUsage ? cacheHitRate(lastUsage) : undefined;

  return (
    <div className="app">
      <div className="body">
        <aside className="sidebar">
          <div className="sidebar-top">
            <button
              type="button"
              className="new-conversation"
              disabled={status.state !== "connected" || !selectedId}
              onClick={() => void onCreateConversation()}
            >
              <span className="plus">＋</span> 新会话
            </button>
          </div>

          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            disabled={status.state !== "connected"}
            onSelect={(id) => void onSelectConversation(id)}
          />

          <div className="sidebar-panels">
            <RecallPanel
              recall={recall}
              busy={recallBusy}
              dirty={recallDirty}
              restarting={restarting}
              status={status}
              usageTotals={usageTotals}
              lastUsage={lastUsage}
              onRefresh={() => void refreshRecall()}
              onBuild={() => void buildRecallIndex()}
              onApply={(setting) => void applyRecallSetting(setting)}
              onRestart={() => void restartServer()}
            />
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="topbar-title">
              <span className="topbar-name">{agentName}</span>
              <span className="topbar-sub">
                {activeConversationId ?? "尚无会话"}
                {busy ? " · 生成中…" : ""}
              </span>
            </div>
            <WorkingDirectory
              cwd={cwd}
              disabled={status.state !== "connected"}
              onApply={changeWorkingDirectory}
              onList={listDirectory}
            />
            <div className="topbar-actions">
              <select
                className="mode-select"
                value={mode}
                disabled={status.state !== "connected"}
                title={PERMISSION_HINT[mode]}
                onChange={(event) => void onModeChange(event.target.value as PermissionMode)}
              >
                {(Object.keys(PERMISSION_LABEL) as PermissionMode[]).map((value) => (
                  <option key={value} value={value}>
                    {PERMISSION_LABEL[value]}
                  </option>
                ))}
              </select>
              <AgentPicker
                agents={agents}
                selectedId={selectedId}
                onSelect={(id) => void onSelectAgent(id)}
                disabled={status.state !== "connected"}
              />
              <button
                type="button"
                className="ghost"
                disabled={!activeConversationId || status.state !== "connected"}
                onClick={() => void reloadHistory()}
                title="重新拉取当前会话的历史消息"
              >
                刷新
              </button>
            </div>
          </header>

          <div className="thread">
            <MessageList items={items} loading={loadingHistory} usageByItem={usageByItem} />
          </div>

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
            <div className="composer-box">
              <textarea
                value={draft}
                placeholder={
                  runtime ? "给 agent 发消息…（Enter 发送，Shift+Enter 换行）" : "先选择一个 agent"
                }
                disabled={!runtime}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void onSubmit(event);
                  }
                }}
              />
              <div className="composer-bar">
                <span className="composer-hint">
                  {busy ? "生成中…" : runtime ? "Enter 发送" : "等待 agent"}
                </span>
                <div className="composer-right">
                  {lastUsage ? (
                    <span className="composer-usage" title="上一轮用量（仅 token，无成本）">
                      ↑{formatTokens(lastUsage.promptTokens)} ↓{formatTokens(lastUsage.completionTokens)}
                      {hit !== undefined ? ` · 缓存 ${Math.round(hit)}%` : ""}
                    </span>
                  ) : null}
                  <button type="button" className="interrupt" disabled={!busy} onClick={() => void interrupt()}>
                    中断
                  </button>
                  <button
                    type="submit"
                    className="send"
                    disabled={!runtime || busy || !draft.trim()}
                    title="发送（Enter）"
                  >
                    ↑
                  </button>
                </div>
              </div>
            </div>
          </form>

          <StatusBar
            summary={{
              state: status.state,
              ...(status.haruyukiVersion ? { haruyukiVersion: status.haruyukiVersion } : {}),
              ...(status.protocolVersion ? { protocolVersion: status.protocolVersion } : {}),
              ...(status.backend ? { backend: status.backend } : {}),
              contextTokens: lastUsage?.contextTokens ?? 0,
              totalTokens: usageTotals.promptTokens + usageTotals.completionTokens,
              ...(hit !== undefined ? { cacheHitRate: hit } : {}),
              recallTurns: activeConversation?.recallInjectedMessageIds?.length ?? 0,
              recallMissing: recall?.missing ?? 0,
            }}
          />
        </main>
      </div>
    </div>
  );
}
