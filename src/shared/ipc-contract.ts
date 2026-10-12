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
  /**
   * 界面上的提示条目。
   *
   * ⚠️ `level` 不能省：这个组件历史上**只有红底**的配色（那是给错误用的），
   * 于是一条"召回索引已构建：…"的**成功**提示也长成报错的样子（实测截图里看到）。
   * 默认 `info`（中性），只有真正的失败才是 `error`。
   */
  | { id: string; kind: "notice"; text: string; level?: "info" | "error" };

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

/**
 * `haruyuki recall …` 子命令的输出。
 *
 * 上游有 `haruyuki recall <build|status|now|on|off|…>` 这个**不依赖 TUI 的顶层子命令**
 * （源码原话："任何其它 `/recall` 子命令在这里也能用，所以脚本可以设置旋钮"），
 * GUI 就是 spawn 它、把 stdout 拿回来显示。
 */
export interface RecallCommandResult {
  /** 命令是否成功（退出码 0）。失败时也返回，但 `ok === false` 且带 `error`。 */
  ok: boolean;
  /** 命令的完整输出（stdout + stderr 合并）。**界面直接显示这段原文**。 */
  output: string;
  /** 失败原因（超时 / 非零退出码）。成功时为 undefined。 */
  error?: string;
}

/** 从 `recall status` 里解析出来的当前设置值（能反读的部分）。 */
export interface RecallSettingsSnapshot {
  limit?: number;
  excerptCharacters?: number;
  totalCharacters?: number;
  ratio?: number;
  diversity?: RecallDiversity;
  dedup?: number;
  timeoutMs?: number;
  display?: RecallDisplayTier;
}

export interface RecallStatusSummary {
  enabled: boolean;
  /** 索引覆盖率描述，例如 `22/22 conversations indexed · 59 records`。 */
  indexLine: string;
  /** 有多少会话**还没有**索引（>0 意味着 recall 处于静默失效状态）。 */
  missing: number;
  settings: RecallSettingsSnapshot;
  /** 原始输出，供界面原样展示 —— 解析失败时也不至于什么都看不到。 */
  raw: string;
}

/**
 * 解析 `haruyuki recall status` 的输出。
 *
 * 放在 `shared/` 而不是主进程的 `recall.ts`，是因为渲染进程也要用它 ——
 * 而 `recall.ts` import 了 `node:child_process`，被渲染进程 import 会污染浏览器 bundle。
 *
 * **刻意写得宽容**：解析不出来不是错误。上游换个措辞就会解析失败，那时界面仍要把
 * `raw` 原样显示，绝不能因为"解析失败"就让用户什么都看不到。所以这里**不抛异常**，
 * 最坏情况只是某些字段拿不到。
 *
 * ⚠️ `excerpt`（摘录**行数**）**不在** status 输出里（实测：改成 3 后 `Settings:` 行没变），
 * 所以它的当前值**无法反读** —— 界面必须如实告诉用户这一点，不许假装知道。
 */
export function parseRecallStatus(output: string): RecallStatusSummary {
  const lines = output.split("\n");
  const indexLine = lines.find((line) => line.startsWith("Index:")) ?? "";
  const recallLine = lines.find((line) => line.startsWith("Recall:")) ?? "";
  const settingsLine = lines.find((line) => line.startsWith("Settings:")) ?? "";

  // `Index: 0/22 conversations indexed · 0 records · 22 without an index`
  const missingMatch = /(\d+)\s+without an index/.exec(indexLine);

  const num = (re: RegExp): number | undefined => {
    const match = re.exec(settingsLine);
    return match?.[1] === undefined ? undefined : Number(match[1]);
  };
  const excerpt = /excerpt\s+(\d+)\/(\d+)\s+chars/.exec(settingsLine);
  const diversityRaw = /diversity\s+(\w+)/.exec(settingsLine)?.[1];
  const displayRaw = /display\s+(\w+)/.exec(settingsLine)?.[1];

  const settings: RecallSettingsSnapshot = {
    ...(num(/limit\s+(\d+)/) !== undefined ? { limit: num(/limit\s+(\d+)/) } : {}),
    ...(excerpt?.[1] !== undefined ? { excerptCharacters: Number(excerpt[1]) } : {}),
    ...(excerpt?.[2] !== undefined ? { totalCharacters: Number(excerpt[2]) } : {}),
    ...(num(/ratio\s+([\d.]+)/) !== undefined ? { ratio: num(/ratio\s+([\d.]+)/) } : {}),
    ...(num(/dedup\s+(\d+)/) !== undefined ? { dedup: num(/dedup\s+(\d+)/) } : {}),
    ...(num(/timeout\s+(\d+)/) !== undefined ? { timeoutMs: num(/timeout\s+(\d+)/) } : {}),
    ...(diversityRaw === "none" || diversityRaw === "file" || diversityRaw === "split"
      ? { diversity: diversityRaw }
      : {}),
    ...(displayRaw === "silent" || displayRaw === "summary" || displayRaw === "full"
      ? { display: displayRaw }
      : {}),
  };

  return {
    enabled: /Recall:\s*on\b/.test(recallLine),
    indexLine: indexLine.replace(/^Index:\s*/, "").trim(),
    missing: missingMatch?.[1] ? Number(missingMatch[1]) : 0,
    settings,
    raw: output,
  };
}

/**
 * recall 的 10 个可配置旋钮（上游 `haruyuki recall <setting> <value>`）。
 *
 * 做成**单个方法 + 联合类型**而不是 10 个方法：`tsc` 在编译期就能挡住拼错的旋钮名
 * 和非法枚举值，而**范围**校验（数字上下界）放运行时做主进程里。
 *
 * 参数规则抄自上游解析器，**不要自己发明**：
 * - `timeout` / `dedup` / `limit` / `excerpt` / `chars`：非负整数，`0` 一律表示"关闭"而非"未设置"
 * - `ratio`：**0–1**；上游对 >1 **拒绝**而不是裁剪（因为 >1 意味着"任何分数都过不了门槛"，
 *   静默裁剪会让 recall 被无声关掉）
 * - `diversity` / `display`：枚举
 *
 * ⚠️ `excerpt`（摘录行数）**不会出现在 `haruyuki recall status` 的摘要行里**（实测：
 * 改成 3 之后 `Settings:` 那行没变）。所以界面**无法从 status 反读它的当前值**，
 * 这一项要显式告诉用户"显示的是默认值/你上次设的值"。
 */
export type RecallKnob =
  | "enabled"
  | "timeout"
  | "dedup"
  | "limit"
  | "excerpt"
  | "chars"
  | "ratio"
  | "diversity"
  | "display";

export type RecallDiversity = "none" | "file" | "split";
export type RecallDisplayTier = "silent" | "summary" | "full";

export type RecallSettingValue =
  | { knob: "enabled"; value: boolean }
  | { knob: "timeout" | "dedup" | "limit" | "excerpt"; value: number }
  /** `chars` 是**两个**数字：单条摘录预算 + 整轮总预算。 */
  | { knob: "chars"; value: { perEntry: number; total: number } }
  | { knob: "ratio"; value: number }
  | { knob: "diversity"; value: RecallDiversity }
  | { knob: "display"; value: RecallDisplayTier };

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
  /** 读 recall 状态（spawn `haruyuki recall status`）。只读，不改任何状态。 */
  recallStatus(): Promise<RecallCommandResult>;
  /**
   * 构建召回索引（spawn `haruyuki recall build`）。**这是写操作**，只会由用户
   * 显式点击触发，绝不自动执行 —— 索引为空会让 recall 静默失效。
   */
  recallBuild(): Promise<RecallCommandResult>;
  /**
   * 改一个 recall 设置。**越界的值会被主进程直接拒绝、不会 spawn**（上游还有第二道校验）。
   *
   * ⚠️ 改完**不会立即生效**：`settingsManager` 在进程启动时读一次并缓存，所以必须
   * 调 `restartServer()` 换一个进程。调用方要负责把这个前提告诉用户。
   */
  recallSet(setting: RecallSettingValue): Promise<RecallCommandResult>;
  /**
   * 重启 app-server。
   *
   * 两个用途：① 让改动过的 recall 设置生效；② 从"窗口 reload 后状态卡在
   * 正在启动"里自救。会丢当前 runtime scope（需要重新 runtime_start），
   * 但**会话历史不丢**（在磁盘上）。
   */
  restartServer(): Promise<ServerStatus>;
  onStatus(handler: (status: ServerStatus) => void): () => void;
  onEvent(handler: (event: HaruyukiEvent) => void): () => void;
}
