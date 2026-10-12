import { AppServerClient } from "haruyuki/app-server-client";
import type { WsProtocolCommand, WsProtocolMessage } from "haruyuki/app-server-protocol";
import type {
  AgentSummary,
  ChatItem,
  ConversationHistory,
  ConversationSummary,
  HaruyukiEvent,
  PermissionMode,
  DirectoryListing,
  MemoryCommit,
  MemoryFile,
  MemorySnapshot,
  ModelCatalog,
  RuntimeScope,
  UsageStats,
  WorkingDirectorySummary,
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
  // `context_management.recall_injected_turns` 的**键**形如
  // `transcript:<base64 会话 key>:<消息 id>`，值是次数。我们只关心消息 id 部分。
  const recallTurns = asRecord(asRecord(conversation.context_management).recall_injected_turns);
  const recallInjectedMessageIds = Object.keys(recallTurns)
    .map((key) => key.slice(key.lastIndexOf(":") + 1))
    .filter((id) => id.length > 0);

  return {
    id: str(conversation.id),
    agentId: str(conversation.agent_id),
    ...(str(conversation.summary) ? { summary: str(conversation.summary) } : {}),
    messageCount: Array.isArray(conversation.in_context_message_ids)
      ? conversation.in_context_message_ids.length
      : 0,
    ...(recallInjectedMessageIds.length > 0 ? { recallInjectedMessageIds } : {}),
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

/** 把 `list_memory` / `read_memory_file` 的条目归一成界面用的形状。 */
function toMemoryFile(entry: Record<string, unknown>): MemoryFile {
  const path = str(entry.relative_path) || str(entry.path);
  const content = typeof entry.content === "string" ? entry.content : "";
  return {
    path,
    isSystem: entry.is_system === true,
    content,
    size: typeof entry.size === "number" ? entry.size : content.length,
    kind: str(entry.kind) || "text",
    ...(str(entry.description) ? { description: str(entry.description) } : {}),
    ...(str(entry.mime_type) ? { mimeType: str(entry.mime_type) } : {}),
  };
}

/** 去掉结尾斜杠，便于比较路径（服务端可能保留也可能去掉）。 */
function stripTrailingSlash(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

/**
 * 判断两个路径是否指同一个目录。
 *
 * 为什么不能逐字符比较：服务端会对目录做 `realpath` **归一化**，而那条归一化结果
 * **无法通过协议拿到**（`list_in_directory` 的 `path` 只是回显请求值）。
 * 实测：macOS 上发 `/var/folders/...`，回读是 `/private/var/folders/...`
 * —— 逐字符比较会把**成功的切换报成失败**（真踩过）。
 *
 * 所以按**路径边界**接受归一化：相等，或一方是另一方加上前缀的同一路径。
 * 明显的失败（完全不相干、或仍是旧目录）依然会被判为失败。
 */
function sameWorkingDirectory(expected: string, actual: string): boolean {
  const a = stripTrailingSlash(expected);
  const b = stripTrailingSlash(actual);
  if (a === b) return true;
  return a.endsWith(`/${b.replace(/^\/+/, "")}`) || b.endsWith(`/${a.replace(/^\/+/, "")}`);
}

/** 读不到工作目录时统一抛这个错，避免各处写法不一致。 */
function failMissingWorkingDirectory(): never {
  throw new Error("切换后读不到工作目录");
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

/**
 * 复刻服务端 `getWorkingDirectoryScopeKey()` 的规则。
 *
 * ⚠️ 必须与 `src/websocket/listener/cwd.ts` **保持一致**，否则我们会去查一个
 * 不存在的 key，界面就会谎报"没有覆盖"。服务端的规则是：
 * - `default` 会话 → `agent:<agentId|__unknown__>::conversation:default`
 * - 其它会话       → `conversation:<conversationId>`
 *
 * （`normalizeConversationId(undefined)` 服务端按 `"default"` 处理。）
 */
export function workingDirectoryScopeKey(
  agentId: string | null | undefined,
  conversationId: string | null | undefined,
): string {
  const normalizedConversation = conversationId?.trim() || "default";
  if (normalizedConversation === "default") {
    const normalizedAgent = agentId?.trim() || "__unknown__";
    return `agent:${normalizedAgent}::conversation:default`;
  }
  return `conversation:${normalizedConversation}`;
}

/** 把服务端的原始帧收敛成 GUI 关心的少量事件。 */
/**
 * 增量事件的批处理窗口（毫秒）。
 *
 * ## 为什么必须批处理（性能 bug 的根因）
 *
 * 服务端是**逐 token** 推 delta 的。修复前实测一轮短回复就产生 **231 次增量事件**
 * （`reasoning_delta` 225 + `assistant_delta` 6）—— 而渲染进程每收到一次就
 * **复制整个 items 数组**（`O(n)`）并**全量重渲染**整棵消息树。合起来是 O(n²)，
 * 于是"发一句你好"就能把 CPU 打满、界面卡死。
 *
 * 50ms 是刻意的：比人眼能分辨的间隔小（视觉上仍是连续流式），又能把
 * 数百次事件压到十几次。
 */
const DELTA_FLUSH_MS = 50;

export class AppServerBridge {
  private client: AppServerClient | null = null;

  /**
   * `runtime_start` 解析出的作用域。
   *
   * ⚠️ `InputCommand.runtime` 是**必填**字段（见 src/types/protocol_v2.ts:650-656）。
   * 缺了它，消息不会被当成有效输入处理 —— 这是实测抓到的第二个 bug。
   */
  private runtime: RuntimeScope | null = null;

  /** 待冲刷的正文增量（批处理窗口内累积）。 */
  private pendingAssistant = "";
  /** 待冲刷的推理增量。 */
  private pendingReasoning = "";
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly emit: (event: HaruyukiEvent) => void) {}

  /**
   * 把增量文本放进缓冲，并在窗口结束时**一次性**发出。
   *
   * 正文与推理共用一个事件（`stream_batch`）—— 分开成两个事件会让渲染进程
   * 在同一个窗口里做两次 `setItems`，等于白批了一半。
   */
  private queueDelta(kind: "assistant" | "reasoning", text: string): void {
    if (!text) return;
    if (kind === "assistant") this.pendingAssistant += text;
    else this.pendingReasoning += text;
    if (this.flushTimer !== null) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flushDeltas();
    }, DELTA_FLUSH_MS);
  }

  /**
   * 立即冲刷缓冲。
   *
   * ⚠️ **任何非增量事件之前都必须先冲刷** —— 否则顺序会错乱
   * （例如 `turn_finished` 先到、正文后到，界面就会出现"回合结束但正文还在长"）。
   */
  private flushDeltas(): void {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    const assistant = this.pendingAssistant;
    const reasoning = this.pendingReasoning;
    this.pendingAssistant = "";
    this.pendingReasoning = "";
    if (!assistant && !reasoning) return;
    this.emit({
      kind: "stream_batch",
      ...(assistant ? { assistant } : {}),
      ...(reasoning ? { reasoning } : {}),
    });
  }

  /** 丢掉尚未冲刷的缓冲（关连接时用，避免往已关闭的窗口发事件）。 */
  private discardPendingDeltas(): void {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.pendingAssistant = "";
    this.pendingReasoning = "";
  }

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

  /**
   * 当前 runtime 所属的 agent id（`runtime_start` 之后就确定了）。
   *
   * recall 试搜必须带 `--agent`，而主进程没有渲染进程的状态 —— 这里就是权威来源，
   * 因为它记录的是**真正恢复过的那个 runtime**。
   */
  currentAgentId(): string | null {
    return this.runtime?.agent_id ?? null;
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

  /**
   * 按标题搜会话（`conversation_list` + `summary_search`）。
   *
   * 服务端在 `listLocalConversations` 里按 `id` 与 `summary` 做 includes 匹配。
   * 默认页大小 20（服务端侧），所以这里显式放大 limit —— 搜索场景下"只看到前 20 条"
   * 比"慢一点"更糟（用户会以为没有更多）。
   */
  async searchConversations(agentId: string, query: string): Promise<ConversationSummary[]> {
    if (!agentId) throw new Error("searchConversations 需要 agentId");
    const term = query.trim();
    if (!term) return [];
    const response = (await this.current.request("conversation_list", {
      query: { agent_id: agentId, summary_search: term, limit: 100 },
    })) as unknown as { success?: boolean; conversations?: unknown[]; error?: string };
    if (response.success === false) {
      throw new Error(`搜索会话失败：${response.error ?? "未知原因"}`);
    }
    return (response.conversations ?? []).map(toConversationSummary);
  }

  /** 见 `fetchConversationHistory` 的说明。 */
  async loadConversation(conversationId: string): Promise<ConversationHistory> {
    return fetchConversationHistory(this.conversationClient(), conversationId);
  }

  /** 原始消息帧，仅供自测验证排序用。 */
  async rawConversationMessages(conversationId: string): Promise<unknown[]> {
    return fetchConversationMessages(this.conversationClient(), conversationId);
  }

  /** 新建 agent（只给 name；见 `HaruyukiApi.createAgent` 的范围说明）。 */
  async createAgent(name: string): Promise<AgentSummary> {
    const wanted = name.trim();
    if (!wanted) throw new Error("agent 名称不能为空");
    const response = (await this.current.request("agent_create", {
      body: { name: wanted },
    })) as unknown as { success?: boolean; agent?: unknown; error?: string };
    if (response.success === false) {
      throw new Error(`新建 agent 失败：${response.error ?? "未知原因"}`);
    }
    const agent = asRecord(response.agent);
    const id = str(agent.id);
    if (!id) throw new Error("新建 agent 成功但回执里没有 id");
    return {
      id,
      ...(str(agent.name) ? { name: str(agent.name) } : {}),
      ...(str(agent.description) ? { description: str(agent.description) } : {}),
    };
  }

  /** 给会话改名（见 `HarukiApi.renameConversation` 的说明：改的是 `summary`）。 */
  async renameConversation(conversationId: string, summary: string): Promise<void> {
    if (!conversationId) throw new Error("renameConversation 需要 conversationId");
    const response = (await this.current.request("conversation_update", {
      conversation_id: conversationId,
      body: { summary },
    })) as unknown as { success?: boolean; error?: string };
    if (response.success === false) {
      throw new Error(`会话改名失败：${response.error ?? "未知原因"}`);
    }
  }

  /**
   * 列出 agent 的记忆文件（`list_memory`）。
   *
   * 实测：**一次返回全部文件且自带 `content`**（单帧响应，非分块）。
   * 所以浏览器不需要为每个文件再发一次 `read_memory_file`。
   */
  async listMemory(agentId: string): Promise<MemorySnapshot> {
    if (!agentId) throw new Error("listMemory 需要 agentId");
    const response = (await this.current.request("list_memory", { agent_id: agentId })) as unknown as {
      success?: boolean;
      entries?: unknown[];
      memfs_enabled?: boolean;
      memfs_initialized?: boolean;
      error?: string;
    };
    if (response.success === false) {
      throw new Error(`list_memory 失败：${response.error ?? "未知原因"}`);
    }
    return {
      files: (response.entries ?? []).map((raw) => toMemoryFile(asRecord(raw))),
      memfsEnabled: response.memfs_enabled === true,
      memfsInitialized: response.memfs_initialized === true,
    };
  }

  /**
   * 读记忆文件的**原始内容**（含 frontmatter）。
   *
   * ⚠️ `read_memory_file` 的响应结构与 `list_memory` 的条目**不同**：
   * 它是 `{ path, content, encoding, success }`，`content` 是**完整原文**（含 frontmatter）。
   * 早先我错把它按 list 条目的形状去映射（找 `relative_path`），会一路取到空值。
   */
  async readMemoryFile(agentId: string, path: string): Promise<string> {
    if (!agentId) throw new Error("readMemoryFile 需要 agentId");
    if (!path) throw new Error("readMemoryFile 需要 path");
    const response = (await this.current.request("read_memory_file", {
      agent_id: agentId,
      path,
    })) as unknown as { success?: boolean; content?: string; error?: string };
    if (response.success === false) {
      throw new Error(`读取记忆文件失败：${response.error ?? "未知原因"}`);
    }
    if (typeof response.content !== "string") {
      throw new Error("读取记忆文件成功但没拿到 content");
    }
    return response.content;
  }

  /**
   * 写记忆文件（`write_memory_file`）。**写操作，且服务端会立刻提交一次 git**。
   *
   * 服务端会拒绝逃逸出记忆根的路径。我们**不自己拼路径**，原样把它交给服务端裁定，
   * 免得自制的校验与服务端不一致反而给出错误的安全感。
   */
  async writeMemoryFile(
    agentId: string,
    path: string,
    content: string,
    commitMessage?: string,
  ): Promise<void> {
    if (!agentId) throw new Error("writeMemoryFile 需要 agentId");
    if (!path) throw new Error("writeMemoryFile 需要 path");
    const response = (await this.current.request("write_memory_file", {
      agent_id: agentId,
      path,
      content,
      ...(commitMessage?.trim() ? { commit_message: commitMessage.trim() } : {}),
    })) as unknown as { success?: boolean; error?: string };
    if (response.success === false) {
      throw new Error(`写入记忆文件失败：${response.error ?? "未知原因"}`);
    }
  }

  /** 删记忆文件（`delete_memory_file`）。**写操作。** */
  async deleteMemoryFile(agentId: string, path: string, commitMessage?: string): Promise<void> {
    if (!agentId) throw new Error("deleteMemoryFile 需要 agentId");
    if (!path) throw new Error("deleteMemoryFile 需要 path");
    const response = (await this.current.request("delete_memory_file", {
      agent_id: agentId,
      path,
      ...(commitMessage?.trim() ? { commit_message: commitMessage.trim() } : {}),
    })) as unknown as { success?: boolean; error?: string };
    if (response.success === false) {
      throw new Error(`删除记忆文件失败：${response.error ?? "未知原因"}`);
    }
  }

  /** 记忆提交历史（`memory_history`）。不传 path = 全部文件的全局历史。 */
  async memoryHistory(agentId: string, path?: string, limit = 50): Promise<MemoryCommit[]> {
    if (!agentId) throw new Error("memoryHistory 需要 agentId");
    const response = (await this.current.request("memory_history", {
      agent_id: agentId,
      ...(path ? { file_path: path } : {}),
      limit,
    })) as unknown as { success?: boolean; commits?: unknown[]; error?: string };
    if (response.success === false) {
      throw new Error(`读取记忆历史失败：${response.error ?? "未知原因"}`);
    }
    return (response.commits ?? []).map((raw) => {
      const c = asRecord(raw);
      const hash = str(c.hash) || str(c.id) || str(c.commit);
      return {
        hash,
        ...(str(c.message) ? { message: str(c.message) } : {}),
        ...(str(c.date) ? { date: str(c.date) } : {}),
      };
    });
  }

  /** 列出可选模型（`list_models`）。 */
  async listModels(): Promise<ModelCatalog> {
    const response = (await this.current.request("list_models", {})) as unknown as {
      success?: boolean;
      entries?: unknown[];
      available_handles?: unknown;
      error?: string;
    };
    if (response.success === false) {
      throw new Error(`list_models 失败：${response.error ?? "未知原因"}`);
    }
    const options = (response.entries ?? []).map((raw) => {
      const entry = asRecord(raw);
      const id = str(entry.id);
      const handle = str(entry.handle);
      const label = str(entry.label) || handle || id;
      // `id` 形如 `<model>-<effort>`，尾部即推理档位；取不到就不显示档位。
      const effortMatch = /-(none|minimal|low|medium|high|xhigh|max)$/.exec(id);
      return {
        id,
        handle,
        label,
        ...(effortMatch?.[1] ? { effort: effortMatch[1] } : {}),
      };
    });
    return {
      options,
      availableHandles: Array.isArray(response.available_handles)
        ? response.available_handles.map((h) => str(h))
        : [],
    };
  }

  /**
   * 切换当前会话的模型。
   *
   * 用 `model_id`（`list_models` 的 `id`）而不是 `model_handle` —— `id` 同时编码
   * **模型与推理档位**，而同一个 handle 有多个档位（实测 deepseek-flash 有
   * none/low/high/max 四条）。只传 handle 会丢掉档位。
   */
  async setModel(
    modelId: string,
  ): Promise<{ modelId?: string; modelHandle?: string; appliedTo?: string }> {
    const runtime = this.requireRuntime();
    const wanted = modelId.trim();
    if (!wanted) throw new Error("modelId 不能为空");
    const response = (await this.current.request("update_model", {
      runtime,
      payload: { model_id: wanted },
    })) as unknown as {
      success?: boolean;
      applied_to?: string;
      model_id?: string;
      model_handle?: string;
      error?: string;
    };
    if (response.success === false) {
      throw new Error(`切换模型失败：${response.error ?? "未知原因"}`);
    }
    return {
      ...(response.model_id ? { modelId: response.model_id } : {}),
      ...(response.model_handle ? { modelHandle: response.model_handle } : {}),
      ...(response.applied_to ? { appliedTo: response.applied_to } : {}),
    };
  }

  /**
   * 读当前会话的工作目录。
   *
   * ⚠️ **`cwd_map` 里没有条目 ≠ 没有工作目录**：那种情况下实际用的是
   * `boot_working_directory`。把"没覆盖"当成"没有目录"是这里最容易犯的错。
   */
  async getWorkingDirectory(): Promise<WorkingDirectorySummary | null> {
    const runtime = this.runtime;
    if (!runtime) return null;
    const response = (await this.current.request("get_cwd_map", {})) as unknown as {
      success?: boolean;
      cwd_map?: Record<string, string>;
      boot_working_directory?: string | null;
      error?: string;
    };
    if (response.success === false) {
      throw new Error(`get_cwd_map 失败：${response.error ?? "未知原因"}`);
    }
    const scopeKey = workingDirectoryScopeKey(runtime.agent_id, runtime.conversation_id);
    const boot = response.boot_working_directory ?? null;
    const override = response.cwd_map?.[scopeKey];
    return {
      current: override ?? boot ?? "",
      boot,
      overridden: override !== undefined,
      scopeKey,
    };
  }

  /**
   * 切换当前会话的工作目录。
   *
   * 三步，顺序不能换：
   *  1. **先校验**（`list_in_directory`）—— 目录不存在就当场失败，不把会话切到死路径上
   *  2. 发 `input` + `payload.cwd`，并**等 `input_accepted` 回执**（不是 fire-and-forget）
   *  3. **回读 `get_cwd_map` 确认真的生效** —— 服务端把路径 `realpath` 归一化过，
   *     所以回读值可能与传入值不同；只信回读值
   *
   * 之所以要第 3 步：`payload.cwd` 这条通道**没有专门的响应帧**（服务端在
   * `handleCwdChange` 里校验失败是走错误通道的），不确认就可能"以为改了其实没改"。
   */
  async setWorkingDirectory(
    targetPath: string,
    applyToAll = false,
  ): Promise<WorkingDirectorySummary> {
    const runtime = this.requireRuntime();
    const desired = targetPath.trim();
    if (!desired) throw new Error("工作目录不能为空");

    // ① 先用协议校验目录确实存在且可列。
    const listing = await this.listDirectory(desired);
    if (!listing.success) {
      throw new Error(`无法使用该目录：${listing.error ?? desired}`);
    }

    if (applyToAll) {
      // 服务端启动目录：影响所有**没有覆盖**的会话。刻意不碰已有覆盖，
      // 否则会把别的会话的显式选择悄悄改掉。
      const response = (await this.current.request("set_boot_working_directory", {
        cwd: listing.path,
      })) as unknown as { success?: boolean; error?: string };
      if (response.success === false) {
        throw new Error(`设置默认工作目录失败：${response.error ?? "未知原因"}`);
      }
    } else {
      this.changeDeviceState(runtime, { cwd: listing.path });
    }

    // ⚠️ `change_device_state` **没有回执帧**（服务端 `message-router` 那条分支直接
    // return），所以"已发出"不等于"已生效"。必须**轮询回读**确认。
    //
    // 早期版本在这里等一个并不存在的 `input_accepted`，结果必然超时 —— 被 check:cwd 抓到。
    const wanted = stripTrailingSlash(listing.path);
    const deadline = Date.now() + 5_000;
    let after = await this.getWorkingDirectory();
    if (applyToAll) return after ?? failMissingWorkingDirectory();
    while (after && stripTrailingSlash(after.current) !== wanted && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      after = await this.getWorkingDirectory();
    }
    if (!after) failMissingWorkingDirectory();
    if (!sameWorkingDirectory(wanted, after.current)) {
      throw new Error(`目录切换没有生效：期望 ${wanted}，服务端仍报 ${after.current}`);
    }
    // 注意：**不**因为"回读值与传入值字面不同"而报错。服务端会 `realpath` 归一化
    // （macOS 上 `/var/...` → `/private/var/...`），那是成功、不是失败。
    // 界面上显示的始终是**服务端回读的真实路径**，所以用户看到的是解析后的结果。
    return after;
  }

  /**
   * 发 `change_device_state`（**fire-and-forget**：该命令没有响应帧）。
   *
   * ⚠️ 曾经误以为可以走 `input` 的 `payload.cwd` —— **不行**：`input` 的 payload 只接受
   * `kind === "create_message"`，服务端对其它 kind 一律回 `input_accepted{accepted:false}`
   * 并报 "Unsupported input payload kind"。
   *
   * 权限模式（`payload.mode`）走的是**另一个**入口 `runtime_start { mode }`，两者别混。
   */
  private changeDeviceState(runtime: RuntimeScope, payload: Record<string, unknown>): void {
    this.current.send({
      type: "change_device_state",
      runtime,
      payload,
    } as unknown as WsProtocolCommand);
  }

  /** 列一层目录（目录选择器 + 路径校验）。 */
  async listDirectory(path: string): Promise<DirectoryListing> {
    const response = (await this.current.request("list_in_directory", { path })) as unknown as {
      success?: boolean;
      path?: string;
      folders?: string[];
      error?: string;
    };
    return {
      path: str(response.path) || path,
      folders: Array.isArray(response.folders) ? response.folders.map((f) => str(f)) : [],
      success: response.success !== false,
      ...(response.error ? { error: response.error } : {}),
    };
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
    // 丢弃未冲刷的增量：否则定时器可能在窗口关闭后再发一次事件。
    this.discardPendingDeltas();
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

    // 增量事件之外的一切，都要先把缓冲冲刷掉 —— 保证事件顺序与线上一致。
    if (frame.type !== "stream_delta") this.flushDeltas();

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
        this.queueDelta("assistant", extractText(delta.content));
        return;
      case "reasoning_message":
        this.queueDelta("reasoning", str(delta.reasoning) || extractText(delta.content));
        return;
      // 以下都是**非增量**事件：先把正文/推理的缓冲冲刷掉，避免顺序错乱。
      // 非增量事件：先冲刷正文/推理缓冲，保证顺序。
      this.flushDeltas();
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
      // 非增量事件：先冲刷正文/推理缓冲，保证顺序。
      this.flushDeltas();
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
      // 非增量事件：先冲刷正文/推理缓冲，保证顺序。
      this.flushDeltas();
      case "tool_return_message":
        this.emit({
          kind: "tool_return",
          id: str(delta.tool_call_id) || str(delta.id),
          output: str(delta.tool_return) || extractText(delta.content),
        });
        return;
      // 用量帧此前一直被静默丢弃。它**只有 token、没有成本** —— 见 UsageStats 的说明。
      // 非增量事件：先冲刷正文/推理缓冲，保证顺序。
      this.flushDeltas();
      case "usage_statistics":
        this.emit({ kind: "usage", usage: parseUsage(delta) });
        return;
      // 非增量事件：先冲刷正文/推理缓冲，保证顺序。
      this.flushDeltas();
      case "loop_error":
        this.emit({ kind: "error", message: str(delta.message) || "回合出错" });
        return;
      // haruyuki 0.2.0 起，recall（被动召回）降级 / 超时 / 断路器跳闸会以
      // `status` 消息到达（服务端 `emitRecoverableStatusNotice` → `emitStatusDelta`）。
      // 不接的话，用户只会看到"这一轮没带上召回内容"而不知道原因。
      // 0.1.3 也会发 status（如 stale_approval_conflict_recovery），只是都被丢了。
      // 非增量事件：先冲刷正文/推理缓冲，保证顺序。
      this.flushDeltas();
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
