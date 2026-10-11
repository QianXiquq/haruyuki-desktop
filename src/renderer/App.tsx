import { useEffect, useState, type FormEvent } from "react";
import { AgentPicker } from "./components/AgentPicker";
import { ApprovalCard } from "./components/ApprovalCard";
import { MessageList } from "./components/MessageList";
import { useHaruyuki } from "./state/use-haruyuki";

const STATE_LABEL: Record<string, string> = {
  starting: "正在启动 app-server…",
  connected: "已连接",
  disconnected: "连接已断开",
  error: "连接失败",
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
    send,
    respond,
    interrupt,
  } = useHaruyuki();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  // 等 app-server 连上再拉 agent 列表，避免在 IPC 就绪前调用。
  useEffect(() => {
    if (status.state !== "connected") return;
    void refreshAgents();
  }, [refreshAgents, status.state]);

  const firstAgentId = agents[0]?.id ?? null;
  useEffect(() => {
    if (selectedId === null && firstAgentId !== null && status.state === "connected") {
      setSelectedId(firstAgentId);
      void selectAgent(firstAgentId);
    }
  }, [firstAgentId, selectedId, status.state, selectAgent]);

  async function onSelect(agentId: string): Promise<void> {
    setSelectedId(agentId);
    await selectAgent(agentId);
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
