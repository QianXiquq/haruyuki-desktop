/** 主进程 ↔ 渲染进程的共享类型。两侧只通过这份契约通信。 */

export type ServerState = "starting" | "connected" | "disconnected" | "error";

/** 与服务端 DevicePermissionMode 对齐（该类型未出现在 protocol barrel 里）。 */
export type PermissionMode = "standard" | "acceptEdits" | "unrestricted" | "strict";

export interface ServerStatus {
  state: ServerState;
  wsUrl?: string;
  protocolVersion?: number;
  error?: string;
}

export interface AgentSummary {
  id: string;
  name?: string;
  description?: string;
}

export interface RuntimeScope {
  agent_id: string;
  conversation_id: string;
}

export type ChatItem =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "assistant"; text: string }
  | { id: string; kind: "reasoning"; text: string }
  | { id: string; kind: "tool_call"; name: string; input: unknown; done: boolean; output?: string }
  | { id: string; kind: "notice"; text: string };

export type HaruyukiEvent =
  | { kind: "status"; status: ServerStatus }
  | { kind: "user_message"; text: string }
  | { kind: "assistant_delta"; text: string }
  | { kind: "reasoning_delta"; text: string }
  | { kind: "tool_call"; id: string; name: string; input: unknown }
  | { kind: "tool_return"; id: string; output: string }
  | { kind: "approval_request"; requestId: string; toolName: string; input: unknown }
  | { kind: "approval_resolved"; requestId: string; decision: string }
  | { kind: "turn_finished"; stopReason?: string }
  | { kind: "loop_status"; status: string }
  | { kind: "queue"; pending: number }
  | { kind: "error"; message: string };

/** preload 通过 contextBridge 暴露给渲染进程的全部能力（白名单）。 */
export interface HaruyukiApi {
  getStatus(): Promise<ServerStatus>;
  listAgents(): Promise<AgentSummary[]>;
  startRuntime(
    agentId: string,
    mode?: PermissionMode,
    conversationId?: string,
  ): Promise<RuntimeScope>;
  sendMessage(text: string): Promise<void>;
  respondApproval(requestId: string, decision: "allow" | "deny"): Promise<void>;
  interrupt(): Promise<void>;
  onStatus(handler: (status: ServerStatus) => void): () => void;
  onEvent(handler: (event: HaruyukiEvent) => void): () => void;
}
