import { AppServerClient } from "haruyuki/app-server-client";
import type { WsProtocolCommand, WsProtocolMessage } from "haruyuki/app-server-protocol";
import type {
  AgentSummary,
  ChatItem,
  ConversationHistory,
  ConversationSummary,
  HaruyukiEvent,
  PermissionMode,
  RuntimeScope,
  UsageStats,
} from "@/shared/ipc-contract";

type Frame = Record<string, unknown> & { type?: string };

/**
 * 从协议字段里取文本。
 *
 * ⚠️ 关键：`assistant_message.content` 是**数组** `[{ type: "text", text: "…" }]`，
 * 不是字符串。当成字符串取会得到空串，正文就渲染成一片空白 —— 这是实测抓到的 bug。
 */
export function extractText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  let out = "";
  for (const part of value) {
    if (part && typeof part === "object") {
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") out += text;
    }
  }
  return out;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** 工具参数在线上是 JSON 字符串，能解析就解析，方便界面展示。 */
function parseArgs(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/**
 * `<system-reminder>…</system-reminder>` 是 haruyuki 自动插入的环境/自我描述信息，
 * **不是用户说的话**。实测每轮 user 消息都被塞好几条，原样渲染会让历史里
 * 第一屏全是噪音。这里与服务端 `src/cli/helpers/conversation-title.ts` 的
 * `stripSystemReminders` 保持同样的语义。
 *
 * ⚠️ **与 CLI 的一处刻意差异**：haruyuki 0.2.0 起，被动召回（recall）的片段也是
 * 一个 `<system-reminder>` 块（标记行 `<recall-injected items=… />`）。CLI 的
 * `removeSystemContextBlocks` **刻意保留**这一块，好让显示层渲染出 `↩ recalled`
 * 摘要行；我们这里**一律剥掉**，等价于把 `recallDisplay` 固定成 `silent`。
 *
 * 这样取舍的理由：那些片段是**几千字的原文**，我们的气泡是纯文本、没有折叠语义，
 * 原样塞进用户气泡会把历史读成一片噪音。代价是界面上看不到"这轮召回了什么"——
 * 想要的话，去 TUI 里 `/recall display summary` 看，或者等 GUI 做召回面板
 * 。
 */
const SYSTEM_REMINDER_RE = /<system-reminder>[\s\S]*?<\/system-reminder>/g;

export function stripSystemReminders(text: string): string {
  return text.replace(SYSTEM_REMINDER_RE, "").trim();
}

/** `tool_return` 可能是字符串，也可能是 `[{ type: "text", text }]` 内容数组。 */
function toolReturnText(value: unknown): string {
  if (typeof value === "string") return value;
  return extractText(value);
}

/** 把工具调用归一成 `{ id, name, input }`；`ToolCall` 里 id 叫 `tool_call_id`。 */
function toolCallOf(raw: unknown): { id: string; name: string; input: unknown } | null {
  const record = asRecord(raw);
  const id = str(record.tool_call_id) || str(record.id);
  const name = str(record.name);
  if (!id && !name) return null;
  return { id: id || `tool-${name}`, name: name || "tool", input: parseArgs(record.arguments) };
}

/**
 * 把 `conversation_messages_list` 的原始消息数组翻译成界面用的 ChatItem[]。
 *
 * 三个必须在这里处理的坑：
 *  1. **顺序是倒的** —— 服务端默认且强制 `desc`（传 `asc` 无效，实测），
 *     不反转就会把最新一条渲染到最上面。
 *  2. **`tool_return_message` 通过 `tool_call_id` 回填 `approval_request_message.tool_call`**
 *     —— 历史里的工具调用要显示成"已执行 + 输出"，不能拆成两条。
 *  3. 用户消息里的 system-reminder 必须剥掉。
 */
export function toChatItems(messages: unknown[]): ChatItem[] {
  return toChatItemsWithDate(messages).map((entry) => entry.item);
}

/**
 * 与 `toChatItems` 相同，但额外带出每条消息的时间戳 —— 时间戳是唯一能客观验证
 * "顺序确实被反转成旧→新"的东西（见 `scripts/conversation-check.ts`）。
 */
export function toChatItemsWithDate(messages: unknown[]): { item: ChatItem; date: string }[] {
  // 先按时间正序（旧 → 新）。服务端给的是 desc，所以反转。
  const ordered = [...messages].reverse();
  const items: ChatItem[] = [];
  const dates: string[] = [];
  // tool_call_id → 已在 items 里落位的工具卡片下标，用于回填 tool_return。
  const toolIndexById = new Map<string, number>();

  const push = (item: ChatItem, date: string): void => {
    items.push(item);
    dates.push(date);
  };

  for (const [index, raw] of ordered.entries()) {
    const message = asRecord(raw);
    const messageType = str(message.message_type);
    const messageId = str(message.id) || `hist-${index}`;
    const date = str(message.date);

    switch (messageType) {
      case "user_message": {
        const text = stripSystemReminders(extractText(message.content));
        // 整条都是 system-reminder 的 user 消息（环境注入）直接丢弃。
        if (text) push({ id: messageId, kind: "user", text }, date);
        continue;
      }
      case "assistant_message": {
        const text = extractText(message.content);
        if (text) push({ id: messageId, kind: "assistant", text }, date);
        continue;
      }
      case "reasoning_message": {
        const text = str(message.reasoning) || extractText(message.content);
        if (text) push({ id: messageId, kind: "reasoning", text }, date);
        continue;
      }
      // 需要审批的工具留的是 approval_request_message；已自动放行的留 tool_call_message。
      // 两者都携带 ToolCall，历史里都是"这个工具被调用过"。
      case "approval_request_message":
      case "tool_call_message": {
        const candidates = Array.isArray(message.tool_calls) && message.tool_calls.length > 0
          ? message.tool_calls
          : [message.tool_call];
        for (const candidate of candidates) {
          const call = toolCallOf(candidate);
          if (!call) continue;
          toolIndexById.set(call.id, items.length);
          push(
            {
              id: `${messageId}:tool:${call.id}`,
              kind: "tool_call",
              name: call.name,
              input: call.input,
              done: false,
            },
            date,
          );
        }
        continue;
      }
      case "tool_return_message": {
        const toolCallId = str(message.tool_call_id);
        const output = toolReturnText(message.tool_return) || extractText(message.content);
        const target = toolIndexById.get(toolCallId);
        const existing = target === undefined ? undefined : items[target];
        if (target !== undefined && existing && existing.kind === "tool_call") {
          items[target] = { ...existing, done: true, output };
        } else {
          // 找不到配对的调用（例如历史上被截断的一页）：单独显示结果，别静默吞掉。
          push(
            { id: messageId, kind: "notice", text: `工具结果（未找到对应的调用记录）：${output}` },
            date,
          );
        }
        continue;
      }
      default:
        // system_message / summary_message / event_message 等对用户无意义，跳过。
        continue;
    }
  }

  return items.map((item, index) => ({ item, date: dates[index] ?? "" }));
}

/** `conversation_list_response` 的一项 → 界面用的摘要。 */
function toConversationSummary(raw: unknown): ConversationSummary {
  const conversation = asRecord(raw);
  const createdAt = str(conversation.created_at);
  const updatedAt = str(conversation.updated_at);
  const lastMessageAt = str(conversation.last_message_at);
  return {
    id: str(conversation.id),
    agentId: str(conversation.agent_id),
    messageCount: Array.isArray(conversation.in_context_message_ids)
      ? conversation.in_context_message_ids.length
      : 0,
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
    ...(lastMessageAt ? { lastMessageAt } : {}),
  };
}

const TITLE_MAX_LENGTH = 48;

/** 折叠空白并截断，做成一行列表标题。 */
function condense(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > TITLE_MAX_LENGTH ? `${flat.slice(0, TITLE_MAX_LENGTH)}…` : flat;
}

/**
 * 从一个会话的消息里挑出最早的**真实**用户发言当标题。
 *
 * 只剥掉 system-reminder 还不够：haruyuki 还会插入 cron 提示、
 * "automated message providing context from prior conversations" 之类的
 * 自动消息，它们同样是 user 角色。这些一律不要当标题 —— 截断后的噪音标题
 * 比没有标题更糟。
 */
const AUTOMATED_USER_TEXT = [
  "This is an automated message",
  "This is an automated reminder",
  "<cron-prompt>",
  "<cron-reminder>",
];

export function deriveConversationTitle(messages: unknown[]): string | undefined {
  // 服务端给的是 desc（最新在前），所以从尾部往前找最早的用户发言。
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = asRecord(messages[index]);
    if (str(message.message_type) !== "user_message") continue;
    const text = stripSystemReminders(extractText(message.content));
    if (!text) continue;
    if (AUTOMATED_USER_TEXT.some((prefix) => text.startsWith(prefix))) continue;
    const title = condense(text);
    if (title) return title;
  }
  return undefined;
}

/**
 * 会话相关请求所需的最小客户端面。
 *
 * 单独定义是为了让下面这几个纯函数能脱离服务端测试（传一个回调式假客户端即可），
 * 同时也避免在每条裸 request 上重复写 `as unknown as`。
 */
export interface ConversationRequestClient {
  request(type: string, body?: Record<string, unknown>): Promise<unknown>;
}

/** 只拉会话列表，不打标题（标题要额外每会话一次请求）。 */
export async function fetchConversationSummaries(
  client: ConversationRequestClient,
  agentId?: string,
): Promise<ConversationSummary[]> {
  const response = (await client.request("conversation_list", {
    ...(agentId ? { query: { agent_id: agentId } } : {}),
  })) as { success?: boolean; conversations?: unknown[]; error?: string };
  if (response.success === false) {
    throw new Error(`conversation_list 失败：${response.error ?? "未知原因"}`);
  }
  return (response.conversations ?? []).map(toConversationSummary);
}

/** 最多给这么多个会话打标题（每个标题要多一次请求，不能无上限地扇出）。 */
const TITLE_FETCH_LIMIT = 30;

/** 最近活动时间，用于把会话排成"最近用过"的顺序。 */
function recencyOf(conversation: ConversationSummary): number {
  const raw =
    conversation.lastMessageAt ?? conversation.updatedAt ?? conversation.createdAt ?? "";
  return Date.parse(raw) || 0;
}

/**
 * 给每个会话补一个标题，并**按最近活动倒序**返回。
 *
 * 服务端**没有任何"取标题"的接口**，只能对每个会话取一次最近一页消息再从里面找
 * 最早的用户发言。所以这里只给最近用过的 `TITLE_FETCH_LIMIT` 个会话打标题
 * （并发发出；客户端 request 支持并发 + 30s 超时），更老的会话标题留空 ——
 * 列表能用远比标题齐全重要。单个会话失败只让那个会话没标题。
 */
export async function attachConversationTitles(
  client: ConversationRequestClient,
  conversations: ConversationSummary[],
): Promise<ConversationSummary[]> {
  const sorted = [...conversations].sort((a, b) => recencyOf(b) - recencyOf(a));
  const titled = await Promise.all(
    sorted.map(async (conversation, index) => {
      if (conversation.messageCount === 0) return conversation;
      if (index >= TITLE_FETCH_LIMIT) return conversation;
      try {
        const page = (await client.request("conversation_messages_list", {
          conversation_id: conversation.id,
        })) as { messages?: unknown[] };
        const title = deriveConversationTitle(page.messages ?? []);
        return title ? { ...conversation, title } : conversation;
      } catch {
        return conversation;
      }
    }),
  );
  return titled;
}

/**
 * 取一个会话的原始消息帧（未翻译）。
 *
 * 界面上不用，但自测需要拿到时间戳等原始字段来客观验证排序 —— 见
 * `scripts/conversation-check.ts`。
 */
export async function fetchConversationMessages(
  client: ConversationRequestClient,
  conversationId: string,
): Promise<unknown[]> {
  const response = (await client.request("conversation_messages_list", {
    conversation_id: conversationId,
  })) as { success?: boolean; messages?: unknown[]; error?: string };
  if (response.success === false) {
    throw new Error(`conversation_messages_list 失败：${response.error ?? "未知原因"}`);
  }
  return response.messages ?? [];
}

/**
 * 把一个会话的历史消息翻译成界面条目。
 *
 * 恢复会话必须单独取历史：实测 `runtime_start { conversation_id }` **不会**
 * 重放历史消息（只重放 loop/queue 状态）。
 */
export async function fetchConversationHistory(
  client: ConversationRequestClient,
  conversationId: string,
): Promise<ConversationHistory> {
  if (!conversationId) throw new Error("loadConversation 需要 conversationId");
  const response = (await client.request("conversation_messages_list", {
    conversation_id: conversationId,
  })) as { success?: boolean; messages?: unknown[]; has_more?: boolean; error?: string };
  if (response.success === false) {
    throw new Error(`conversation_messages_list 失败：${response.error ?? "未知原因"}`);
  }
  return {
    items: toChatItems(response.messages ?? []),
    hasMore: response.has_more === true,
  };
}

/** 协议里的数字字段可能是 undefined / 字符串 / null，一律收敛成非负整数。 */
function int(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

/**
 * 解析 `usage_statistics` 帧。
 *
 * ⚠️ **`total_tokens` 不是本轮用量** —— 实测它等于 `context_tokens`（当前上下文规模），
 * 而本轮用量是 `prompt_tokens` / `completion_tokens`。当成同一回事会让每轮数字虚高几十倍。
 *
 * 实测形状（0.2.0）：
 * ```json
 * { "message_type": "usage_statistics", "prompt_tokens": 933, "completion_tokens": 84,
 *   "total_tokens": 28025, "cached_input_tokens": 27008, "cache_write_tokens": 0,
 *   "reasoning_tokens": 78, "context_tokens": 28025 }
 * ```
 */
export function parseUsage(delta: Record<string, unknown>): UsageStats {
  return {
    promptTokens: int(delta.prompt_tokens),
    completionTokens: int(delta.completion_tokens),
    cachedInputTokens: int(delta.cached_input_tokens),
    reasoningTokens: int(delta.reasoning_tokens),
    contextTokens: int(delta.context_tokens) || int(delta.total_tokens),
  };
}

/** 把服务端的原始帧收敛成 GUI 关心的少量事件。 */
export class AppServerBridge {
  private client: AppServerClient | null = null;

  /**
   * `runtime_start` 解析出的作用域。
   *
   * ⚠️ `InputCommand.runtime` 是**必填**字段（见 src/types/protocol_v2.ts:650-656）。
   * 缺了它，消息不会被当成有效输入处理 —— 这是实测抓到的第二个 bug。
   */
  private runtime: RuntimeScope | null = null;

  constructor(private readonly emit: (event: HaruyukiEvent) => void) {}

  async connect(wsUrl: string, WebSocketImpl: unknown): Promise<number> {
    const client = new AppServerClient({ url: wsUrl, WebSocket: WebSocketImpl as never });
    this.client = client;

    client.onMessage((message: WsProtocolMessage) => this.handleMessage(message));
    client.onDisconnect(({ event }) => {
      this.emit({ kind: "status", status: { state: "disconnected", wsUrl, error: String(event) } });
    });

    await client.connect();
    const info = (await client.info()) as unknown as {
      protocol_version?: number;
      letta_code_version?: string;
      backend?: string;
    };
    const protocolVersion = Number(info.protocol_version ?? 0);
    const haruyukiVersion = str(info.letta_code_version);
    const backend = str(info.backend);
    this.emit({
      kind: "status",
      status: {
        state: "connected",
        wsUrl,
        protocolVersion,
        ...(haruyukiVersion ? { haruyukiVersion } : {}),
        ...(backend ? { backend } : {}),
      },
    });
    return protocolVersion;
  }

  get current(): AppServerClient {
    if (!this.client) throw new Error("尚未连接到 app-server");
    return this.client;
  }

  private requireRuntime(): RuntimeScope {
    if (!this.runtime) throw new Error("尚未 runtime_start，无法发送消息");
    return this.runtime;
  }

  async listAgents(): Promise<AgentSummary[]> {
    const response = (await this.current.request("agent_list", {})) as unknown as {
      agents?: unknown[];
    };
    return (response.agents ?? []).map((raw) => {
      const agent = asRecord(raw);
      return {
        id: str(agent.id),
        ...(str(agent.name) ? { name: str(agent.name) } : {}),
        ...(str(agent.description) ? { description: str(agent.description) } : {}),
      };
    });
  }

  async startRuntime(
    agentId: string,
    mode?: PermissionMode,
    conversationId?: string,
  ): Promise<RuntimeScope> {
    const response = await this.current.runtimeStart({
      agent_id: agentId,
      ...(mode ? { mode } : {}),
      ...(conversationId ? { conversation_id: conversationId } : {}),
    });
    const frame = response as unknown as {
      success?: boolean;
      runtime?: RuntimeScope | null;
      error?: string;
    };
    if (frame.success === false || !frame.runtime) {
      // 不允许静默失败：把服务端的真实原因抛给渲染进程显示出来。
      throw new Error(frame.error ? `runtime_start 失败：${frame.error}` : "runtime_start 未返回 runtime scope");
    }
    this.runtime = frame.runtime;
    return frame.runtime;
  }

  /**
   * 列出会话（和 `agent_list` 一样没有客户端 helper，走裸 request）。
   *
   * 返回时已按最近活动倒序，并带上推导出来的标题。
   */
  async listConversations(agentId?: string): Promise<ConversationSummary[]> {
    const client = this.conversationClient();
    const summaries = await fetchConversationSummaries(client, agentId);
    return attachConversationTitles(client, summaries);
  }

  /** 见 `fetchConversationHistory` 的说明。 */
  async loadConversation(conversationId: string): Promise<ConversationHistory> {
    return fetchConversationHistory(this.conversationClient(), conversationId);
  }

  /** 原始消息帧，仅供自测验证排序用。 */
  async rawConversationMessages(conversationId: string): Promise<unknown[]> {
    return fetchConversationMessages(this.conversationClient(), conversationId);
  }

  /**
   * 把带重载的 `AppServerClient.request` 收敛成 `ConversationRequestClient`。
   *
   * 只有这一处需要断言 —— 每个调用点各写一次 `as unknown as` 更难维护。
   */
  private conversationClient(): ConversationRequestClient {
    const client = this.current;
    return {
      request: (type, body) => client.request(type as never, body) as unknown as Promise<unknown>,
    };
  }

  sendMessage(text: string): void {
    const runtime = this.requireRuntime();
    this.emit({ kind: "user_message", text });
    this.current.send(this.buildInput(runtime, {
      kind: "create_message",
      messages: [
        {
          role: "user",
          content: text,
          client_message_id: `gui-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        },
      ],
    }));
  }

  respondApproval(requestId: string, decision: "allow" | "deny"): void {
    const runtime = this.requireRuntime();
    this.emit({ kind: "approval_resolved", requestId, decision });
    this.current.send(this.buildInput(runtime, {
      kind: "approval_response",
      request_id: requestId,
      // ⚠️ decision 是**判别对象** { behavior }，不是裸字符串 "allow"/"deny"。
      // 发裸字符串会让服务端解析失败并回 loop_error（实测踩过）。
      // 另外 deny 分支的 message 是必填。
      decision:
        decision === "allow"
          ? { behavior: "allow" }
          : { behavior: "deny", message: "用户在 Haruyuki Desktop 中拒绝" },
    }));
  }

  async interrupt(): Promise<void> {
    this.current.send({
      type: "abort_message",
      runtime: this.requireRuntime(),
    } as unknown as WsProtocolCommand);
  }

  close(): void {
    try {
      this.client?.close();
    } catch {
      /* 忽略关闭异常 */
    }
    this.client = null;
    this.runtime = null;
  }

  /**
   * 唯一的形状转换点。
   *
   * `MessageCreate` 来自 `@letta-ai/letta-client` 的线上类型，字段面比这里用到的宽；
   * 这里做一次集中的、有注释的断言，而不是在每个调用点撒 `as never`。
   */
  private buildInput(runtime: RuntimeScope, payload: Record<string, unknown>): WsProtocolCommand {
    return { type: "input", runtime, payload } as unknown as WsProtocolCommand;
  }

  private handleMessage(message: WsProtocolMessage): void {
    const frame = message as unknown as Frame;

    switch (frame.type) {
      case "stream_delta":
        this.handleDelta(asRecord(frame.delta));
        return;
      case "control_request": {
        const request = asRecord(frame.request);
        this.emit({
          kind: "approval_request",
          requestId: str(frame.request_id) || str(frame.id),
          toolName: str(request.tool_name) || "unknown",
          input: request.input ?? null,
        });
        return;
      }
      case "turn_finished": {
        const stopReason = str(frame.stop_reason);
        const error = str(frame.error);
        this.emit({
          kind: "turn_finished",
          ...(stopReason ? { stopReason } : {}),
        });
        if (error) this.emit({ kind: "error", message: error });
        return;
      }
      case "update_loop_status": {
        this.emit({ kind: "loop_status", status: str(asRecord(frame.loop_status).status) });
        return;
      }
      case "update_queue": {
        this.emit({ kind: "queue", pending: (frame.queue as unknown[] | undefined)?.length ?? 0 });
        return;
      }
      default:
        return;
    }
  }

  private handleDelta(delta: Record<string, unknown>): void {
    if (str(delta.type) !== "message") return;

    switch (str(delta.message_type)) {
      case "assistant_message":
        this.emit({ kind: "assistant_delta", text: extractText(delta.content) });
        return;
      case "reasoning_message":
        this.emit({ kind: "reasoning_delta", text: str(delta.reasoning) || extractText(delta.content) });
        return;
      case "tool_call_message": {
        const toolCall = asRecord(delta.tool_call);
        this.emit({
          kind: "tool_call",
          id: str(delta.id) || `tool-${Date.now()}`,
          name: str(toolCall.name) || "tool",
          input: parseArgs(toolCall.arguments),
        });
        return;
      }
      case "approval_request_message": {
        // 需要审批的工具，其调用信息随 approval_request_message 到达
        // （不是单独的 tool_call_message —— 实测确认）。
        const toolCall = asRecord(delta.tool_call);
        this.emit({
          kind: "tool_call",
          id: str(toolCall.tool_call_id) || str(delta.id),
          name: str(toolCall.name) || "tool",
          input: parseArgs(toolCall.arguments),
        });
        return;
      }
      case "tool_return_message":
        this.emit({
          kind: "tool_return",
          id: str(delta.tool_call_id) || str(delta.id),
          output: str(delta.tool_return) || extractText(delta.content),
        });
        return;
      // 用量帧此前一直被静默丢弃。它**只有 token、没有成本** —— 见 UsageStats 的说明。
      case "usage_statistics":
        this.emit({ kind: "usage", usage: parseUsage(delta) });
        return;
      case "loop_error":
        this.emit({ kind: "error", message: str(delta.message) || "回合出错" });
        return;
      // haruyuki 0.2.0 起，recall（被动召回）降级 / 超时 / 断路器跳闸会以
      // `status` 消息到达（服务端 `emitRecoverableStatusNotice` → `emitStatusDelta`）。
      // 不接的话，用户只会看到"这一轮没带上召回内容"而不知道原因。
      // 0.1.3 也会发 status（如 stale_approval_conflict_recovery），只是都被丢了。
      case "status": {
        const text = str(delta.message);
        if (text) this.emit({ kind: "notice", text });
        return;
      }
      default:
        return;
    }
  }
}
