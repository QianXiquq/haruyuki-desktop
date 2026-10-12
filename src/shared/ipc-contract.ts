/** 主进程 ↔ 渲染进程的共享类型。两侧只通过这份契约通信。 */

export type ServerState = "starting" | "connected" | "disconnected" | "error";

/** 与服务端 DevicePermissionMode 对齐（该类型未出现在 protocol barrel 里）。 */
export type PermissionMode = "standard" | "acceptEdits" | "unrestricted" | "strict";

export interface ServerStatus {
  state: ServerState;
  wsUrl?: string;
  protocolVersion?: number;
  /**
   * 服务端自报的 haruyuki 版本（`app_server_info_response.letta_code_version`）。
   *
   * ⚠️ 字段名里带 `letta` 是**上游协议既有命名**（`@letta-ai/letta-client` 是其类型
   * 依赖），不是品牌资产 —— 不要改名也不要删。
   *
   * 没有它就无法分辨对面跑的是 0.1.3 还是 0.2.0：**两个版本的
   * `APP_SERVER_PROTOCOL_VERSION` 都是 1**，光看 `protocol v1` 完全一样。
   */
  haruyukiVersion?: string;
  /** 服务端自报的后端类型（local / api）。 */
  backend?: string;
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

/**
 * `conversation_list_response` 里的一项（实测字段）。
 *
 * ⚠️ 服务端**不提供标题**，`summary` 实测恒为 `null`。列表标题由渲染进程
 * 从首条真实用户消息里推导（见 `ConversationList`）。
 */
export interface ConversationSummary {
  id: string;
  agentId: string;
  /**
   * 列表标题。**服务端不提供**（`summary` 实测恒为 null），由主进程从该会话最早的
   * 一条真实用户消息推导；推不出来（空会话 / 拉取失败）时为 undefined。
   */
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  lastMessageAt?: string;
  /** 在上下文里的消息条数。为 0 表示这是一个从未说过话的空会话。 */
  messageCount: number;
}

/**
 * `conversation_messages_list` 的返回。
 *
 * ⚠️ 服务端**默认 `order="desc"`（最新在前）**，而且实测**不认 `order: "asc"`**
 * —— 传 asc 仍然是 desc。所以主进程必须先反转再渲染，否则历史是倒着的。
 */
export interface ConversationHistory {
  items: ChatItem[];
  /** 更老的消息还存在（用 `next_before` 继续翻页；当前 GUI 尚未接翻页）。 */
  hasMore: boolean;
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
  /**
   * 服务端的信息性提示（`stream_delta` 里的 `status` 消息）。
   * haruyuki 0.2.0 的 recall 降级/超时就是走这条。
   */
  | { kind: "notice"; text: string }
  | { kind: "error"; message: string };

/** preload 通过 contextBridge 暴露给渲染进程的全部能力（白名单）。 */
export interface HaruyukiApi {
  getStatus(): Promise<ServerStatus>;
  listAgents(): Promise<AgentSummary[]>;
  listConversations(agentId?: string): Promise<ConversationSummary[]>;
  loadConversation(conversationId: string): Promise<ConversationHistory>;
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
