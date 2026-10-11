import { useEffect, useState, type FormEvent } from "react";
import { AgentPicker } from "./components/AgentPicker";
import { ApprovalCard } from "./components/ApprovalCard";
import { MessageList } from "./components/MessageList";
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
    refreshAgents,
    selectAgent,
    setPermissionMode,
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
  useEffect(() => {
    if (selectedId === null && firstAgentId !== null && status.state === "connected") {
      setSelectedId(firstAgentId);
      void selectAgent(firstAgentId, mode);
    }
  }, [firstAgentId, selectedId, status.state, selectAgent, mode]);

  async function onSelect(agentId: string): Promise<void> {
    setSelectedId(agentId);
    await selectAgent(agentId, mode);
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
          {status.protocolVersion ? ` · protocol v${status.protocolVersion}` : ""}
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
          onSelect={(id) => void onSelect(id)}
          disabled={status.state !== "connected"}
        />
      </header>

      <MessageList items={items} />

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
          <button type="button" className="interrupt" disabled={!busy} onClick={() => void interrupt()}>
            中断
          </button>
        </div>
      </form>
    </div>
  );
}
