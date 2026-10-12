import { useState } from "react";
import type { AgentSummary } from "@/shared/ipc-contract";

interface Props {
  agents: AgentSummary[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (agentId: string) => void;
  /** 新建 agent。只收名称 —— 其余配置由服务端取默认（见 HaruyukiApi.createAgent）。 */
  onCreate: (name: string) => Promise<void>;
}

/**
 * agent 选择器 + 新建入口。
 *
 * ## 为什么"新建 agent"是必需的
 *
 * 实测全新安装下 `agent_list` **只有 1 个 `Tutor`**。TUI 里可以靠 `/agents` 浏览与创建，
 * GUI 之前**什么也做不了** —— 新用户面对的唯一入口是一个他并没有选过的 `Tutor`，
 * 既不知道能换、也没法造一个自己的。
 *
 * ## 为什么只收"名称"
 *
 * `agent_create` 的 body 全部字段可选，实测**只给 name 就够了**（服务端补默认模型
 * 与工具集）。模型 / 系统提示 / 工具集这些配置项数量很大，一个表单塞不下，
 * 也不该在这一轮硬塞进来 —— 需要细调时去 TUI。
 */
export function AgentPicker({ agents, selectedId, disabled, onSelect, onCreate }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 去掉 Electron 给 IPC 错误加的 `Error invoking remote method '…'` 包装。 */
  function clean(e: unknown): string {
    const raw = e instanceof Error ? e.message : String(e);
    return raw.replace(/^Error invoking remote method '[^']*':\s*(Error:\s*)?/, "").trim() || raw;
  }

  async function submit(): Promise<void> {
    const wanted = name.trim();
    if (!wanted) {
      setError("名称不能为空");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onCreate(wanted);
      setName("");
      setCreating(false);
    } catch (e) {
      setError(clean(e));
    } finally {
      setBusy(false);
    }
  }

  if (creating) {
    return (
      <div className="agent-create">
        <input
          type="text"
          className="agent-create-input"
          autoFocus
          value={name}
          disabled={busy}
          placeholder="新 agent 的名称"
          title="只填名称即可：模型与工具集由服务端取默认。需要细调请用 TUI 的 /agents"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
            if (e.key === "Escape") { setCreating(false); setError(null); }
          }}
        />
        <button type="button" className="btn-accent" disabled={busy} onClick={() => void submit()}>
          {busy ? "创建中…" : "创建"}
        </button>
        <button type="button" disabled={busy} onClick={() => { setCreating(false); setError(null); }}>
          取消
        </button>
        {error ? <span className="agent-create-error">⚠️ {error}</span> : null}
      </div>
    );
  }

  return (
    <div className="agent-picker">
      <select
        className="agent-select"
        value={selectedId ?? ""}
        disabled={disabled || agents.length === 0}
        title={agents.length === 0 ? "没有可用 agent —— 点右侧「新建」" : `共 ${agents.length} 个 agent`}
        onChange={(event) => onSelect(event.target.value)}
      >
        {agents.length === 0 ? <option value="">（无 agent）</option> : null}
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name ?? agent.id}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="ghost"
        disabled={disabled}
        title="新建一个 agent（只需填名称）"
        onClick={() => { setCreating(true); setError(null); }}
      >
        ＋ agent
      </button>
    </div>
  );
}
