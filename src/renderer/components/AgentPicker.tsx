import type { AgentSummary } from "@/shared/ipc-contract";

interface Props {
  agents: AgentSummary[];
  selectedId: string | null;
  onSelect: (agentId: string) => void;
  disabled: boolean;
}

export function AgentPicker({ agents, selectedId, onSelect, disabled }: Props) {
  return (
    <div className="agent-picker">
      <label htmlFor="agent-select">Agent</label>
      <select
        id="agent-select"
        value={selectedId ?? ""}
        disabled={disabled || agents.length === 0}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="" disabled>
          {agents.length === 0 ? "（没有可用 agent）" : "选择一个 agent…"}
        </option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name ?? agent.id}
          </option>
        ))}
      </select>
    </div>
  );
}
