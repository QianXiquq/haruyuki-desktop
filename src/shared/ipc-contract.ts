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
 * ⚠️ 服务端**不提供"名字"字段** —— 标题的**首选来源是 `summary`**（会话改名就是改它，
 * 服务端搜索会话时也匹配它），但它默认是 `null`。为 null 时由主进程从首条真实用户
 * 消息里推导（见 `deriveConversationTitle`）。
 */
export interface ConversationSummary {
  id: string;
  agentId: string;
  /**
   * 自定义标题（服务端的 `summary` 字段）。
   *
   * 改名就是设置它；为空表示没有自定义标题，界面回退到 `title`（自动推导）。
   * 它同时是**服务端搜索会话时会匹配的内容**。
   */
  summary?: string;
  /**
   * **自动推导**的标题：主进程从该会话最早的一条真实用户消息得出。
   * 推不出来（空会话 / 拉取失败）时为 undefined。仅在 `summary` 为空时使用。
   */
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  lastMessageAt?: string;
  /** 在上下文里的消息条数。为 0 表示这是一个从未说过话的空会话。 */
  messageCount: number;
  /**
   * 服务端记录的**召回注入痕迹**：消息 id → 该消息所在轮次注入过召回几次。
   *
   * 实测来自 `conversation_list` 的 `context_management.recall_injected_turns`。
   * 这是**唯一**能看出"recall 到底在哪几轮真的生效了"的数据 —— 它的价值在于：
   * 我们一向把注入块整体剥掉（等价于 silent），于是 recall 是个黑盒；
   * 有了它至少能标出"这一轮带过召回内容"，而不必把几千字原文倒进气泡里。
   */
  recallInjectedMessageIds?: string[];
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
  /**
   * **批处理后的**流式增量（主进程每 ~50ms 合并一次）。
   *
   * 为什么需要它：服务端逐 token 推 delta，修复前实测**一轮短回复 231 次增量事件**
   * （推理 225 + 正文 6）。渲染进程每收一次就复制整个 items 数组并全量重渲染，
   * 合起来 O(n²) —— 发一句"你好"就能把 CPU 打满。
   *
   * 正文与推理**合并在同一个事件里**：分成两个事件会让同一个窗口里做两次
   * `setItems`，等于白批一半。
   */
  | { kind: "stream_batch"; assistant?: string; reasoning?: string }
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
  /** 一轮的用量（服务端实测 token 数；**没有成本字段**，见 UsageStats 的说明）。 */
  | { kind: "usage"; usage: UsageStats }
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

/**
 * 一轮的用量统计。
 *
 * ## 为什么只有 token，没有成本
 *
 * 实测确认：`usage_statistics` 实时帧里**有** token 数、**没有**成本字段；
 * 而服务端磁盘上的 `assistant_message.usage.cost` **有**成本，却**被协议整段丢掉**
 * —— `conversation_messages_list` 返回的同一条消息 `usage` 是 `null`（实测）。
 * 上游也**没有**模型价格表（成本由 provider / letta-client 算好回传）。
 *
 * 所以想显示成本只有两条路：自己维护价格表做估算，或者改协议。后者违反"绝不 fork"，
 * 前者是**估算**、且价格表必然过时 —— 已决定不做。**宁可不显示，也不显示猜的数字。**
 *
 * ## 字段语义（实测，别搞错）
 *
 * - `promptTokens` / `completionTokens`：**本轮的**用量
 * - `cachedInputTokens`：本轮有**多少 prompt token 命中缓存**
 * - **`totalTokens` / `contextTokens` 不是本轮用量**，它们等于**当前上下文规模**
 *   （实测：`28025` 而本轮 `prompt=933, completion=84`）。只有"会不会撑爆窗口"才该用它。
 */
export interface UsageStats {
  promptTokens: number;
  completionTokens: number;
  cachedInputTokens: number;
  reasoningTokens: number;
  /** 当前上下文规模（**不是**本轮用量）。 */
  contextTokens: number;
}

/** 把 token 数写成紧凑形式：1234 → "1.2k"；小于 1000 原样。 */
export function formatTokens(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "—";
  if (value < 1000) return String(Math.round(value));
  return `${(value / 1000).toFixed(1)}k`;
}

/**
 * 缓存命中率（0–100 的百分比）。
 *
 * ⚠️ 返回 `undefined`（而不是 0 或 100）的两种情况，界面必须显示 `—`：
 * - `promptTokens` 为 0：除零无意义
 * - `cachedInputTokens` 为 0 且 `promptTokens` 很小：不是"命中率 0%"，而是"没走缓存"
 *
 * 另外**夹住上界 100**：实测见过 `cached 27008 > prompt 933` 这种组合
 * （缓存量与 prompt 的计数口径不同），不加夹会显示成 2896% 这种荒唐数字。
 */
export function cacheHitRate(usage: UsageStats): number | undefined {
  if (usage.promptTokens <= 0) return undefined;
  if (usage.cachedInputTokens <= 0) return undefined;
  const rate = (usage.cachedInputTokens / usage.promptTokens) * 100;
  return Math.min(100, rate);
}

/** 会话累计（**本次运行**，不落盘 —— 见 §7 C 项的口径说明）。 */
export interface UsageTotals {
  turns: number;
  promptTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  cachedInputTokens: number;
  /** 最近一次的上下文规模。 */
  contextTokens: number;
}

export const EMPTY_USAGE_TOTALS: UsageTotals = {
  turns: 0,
  promptTokens: 0,
  completionTokens: 0,
  reasoningTokens: 0,
  cachedInputTokens: 0,
  contextTokens: 0,
};

/** 把一轮用量累加进会话总计。纯函数，便于脱离服务端断言。 */
export function accumulateUsage(totals: UsageTotals, usage: UsageStats): UsageTotals {
  return {
    turns: totals.turns + 1,
    promptTokens: totals.promptTokens + usage.promptTokens,
    completionTokens: totals.completionTokens + usage.completionTokens,
    reasoningTokens: totals.reasoningTokens + usage.reasoningTokens,
    cachedInputTokens: totals.cachedInputTokens + usage.cachedInputTokens,
    // 上下文规模是**瞬时值**，不是累加量 —— 覆盖而不是相加。
    contextTokens: usage.contextTokens,
  };
}

/** 每轮那一行的极简文案：`↑1024 ↓537 · 缓存 95%`。 */
export function formatUsageLine(usage: UsageStats): string {
  const parts = [`↑${formatTokens(usage.promptTokens)}`, `↓${formatTokens(usage.completionTokens)}`];
  const rate = cacheHitRate(usage);
  if (rate !== undefined) parts.push(`缓存 ${Math.round(rate)}%`);
  return parts.join(" ");
}

/** 鼠标悬停时的详情（放 tooltip，不占地方）。 */
export function formatUsageDetail(usage: UsageStats): string {
  const lines = [
    `本轮 prompt：${usage.promptTokens}`,
    `本轮 completion：${usage.completionTokens}（其中推理 ${usage.reasoningTokens}）`,
    `命中缓存的输入：${usage.cachedInputTokens}`,
    `当前上下文规模：${usage.contextTokens}`,
    "",
    "仅 token，无成本：服务端不通过协议下发成本，本 GUI 不做估算。",
  ];
  return lines.join("\n");
}

/**
 * 当前会话的工作目录情况。
 *
 * ## 数据从哪来
 *
 * - `get_cwd_map` 返回**按会话**的覆盖表（`cwd_map`）和一个**服务端启动目录**
 *   （`boot_working_directory`）。没有覆盖的会话用启动目录。
 * - scope key 由服务端 `getWorkingDirectoryScopeKey()` 决定：普通会话是
 *   `conversation:<id>`；`default` 会话是 `agent:<id>::conversation:default`。
 *   所以我们**不自己拼 key**去查表，而是让主进程按 `agent_id` + `conversation_id` 算。
 *
 * ## 为什么这件事对 GUI 特别重要
 *
 * TUI 里你在哪个目录启动、`cd` 到哪里，是**肉眼可见**的。GUI 没有这个直觉：
 * 界面上曾经**完全看不出** agent 在哪工作（实测确认），于是所有涉及文件的任务都是
 * **盲操作** —— 你对它说"改一下这个函数"，它会去服务端启动目录里找，
 * 而你不知道那是哪，也改不了。
 */
export interface WorkingDirectorySummary {
  /** 当前会话实际使用的目录（已解析成绝对路径）。 */
  current: string;
  /** 服务端启动目录 —— 没有覆盖的会话用它。 */
  boot: string | null;
  /** 当前会话是否有自己的覆盖（false 表示用的是 boot）。 */
  overridden: boolean;
  /** 归一化后的 scope key，便于诊断。 */
  scopeKey: string;
}

/** 目录浏览的一层（走 `list_in_directory`，同时用作"路径是否存在"的校验）。 */
export interface DirectoryListing {
  path: string;
  folders: string[];
  success: boolean;
  error?: string;
}

/**
 * 底部状态条要显示的东西。
 *
 * ⚠️ **这里没有"上下文占用百分比"** —— 参考设计里有 `上下文 47%`，但那个分母
 * （上下文窗口上限）**在协议上拿不到**：`Conversation.context_window_limit` 在类型定义里
 * 存在，但本地后端实测**不返回**；`list_models` 的条目里也没有这个字段。
 * 所以状态条只能显示**绝对用量**。宁可少一个数字，也不编一个百分比出来。
 */
export interface StatusSummary {
  state: ServerState;
  haruyukiVersion?: string;
  protocolVersion?: number;
  backend?: string;
  /** 当前会话上下文的 token 规模（绝对值）。 */
  contextTokens: number;
  /** 本次运行的累计 token。 */
  totalTokens: number;
  /** 缓存命中率（0–100，拿不到时为 undefined）。 */
  cacheHitRate?: number;
  /** 有几轮用过召回。 */
  recallTurns: number;
  /** 召回索引里还有多少会话没建（>0 = 部分会话静默失效）。 */
  recallMissing: number;
}

/**
 * 可选模型的一项（来自 `list_models`）。
 *
 * ⚠️ 实测：`entries` 里**一个模型会出现多次**，`id` 编码了"模型 + 推理档位"，
 * `handle` 才是模型本身。例如 deepseek 返回 7 条：
 *
 * ```
 * id=deepseek-flash-none  handle=deepseek/deepseek-flash  label=DeepSeek V4.1 Flash
 * id=deepseek-flash-low   handle=deepseek/deepseek-flash  label=DeepSeek V4.1 Flash
 * id=deepseek-flash-high  handle=deepseek/deepseek-flash  label=DeepSeek V4.1 Flash
 * id=deepseek-flash-max   handle=deepseek/deepseek-flash  label=DeepSeek V4.1 Flash
 * ```
 *
 * 所以**别用 `label` 或 `handle` 当选项的键** —— 会重复、选错。用 `id`。
 * 界面上也要把档位显示出来（`label` 是四条一模一样的），否则用户分不清。
 */
export interface ModelOption {
  id: string;
  handle: string;
  label: string;
  /** 从 `id` 尾部解析出来的推理档位，例如 `none` / `low` / `high` / `max`；解析不出则缺省。 */
  effort?: string;
}

/** `list_models` + `update_model` 的结果。 */
export interface ModelCatalog {
  options: ModelOption[];
  /** 服务端报的可用 handle（`available_handles`）。 */
  availableHandles: string[];
}

/**
 * agent 的记忆文件（来自 `list_memory`）。
 *
 * 实测：`list_memory` **一次返回全部文件且自带 `content`**（单帧
 * `list_memory_response`，不是分块的），所以浏览器不需要额外取正文。
 * 文件路径是**相对记忆根目录**的，且服务端会拒绝逃逸出根目录的路径。
 */
export interface MemoryFile {
  /** 相对记忆根目录的路径，例如 `human.md`、`system/persona.md`。 */
  path: string;
  /** 服务端认为这是"系统"文件（比如人格、引导）。 */
  isSystem: boolean;
  description?: string;
  content: string;
  size: number;
  /** 例如 `markdown` / `image` / `text`。 */
  kind: string;
  mimeType?: string;
}

export interface MemorySnapshot {
  files: MemoryFile[];
  /** MemFS 是否启用。**未启用时记忆是另一套存储**，这份列表可能不完整。 */
  memfsEnabled: boolean;
  memfsInitialized: boolean;
}

/** 一个记忆文件的历史提交（`memory_history`）。 */
export interface MemoryCommit {
  hash: string;
  message?: string;
  date?: string;
}

/** preload 通过 contextBridge 暴露给渲染进程的全部能力（白名单）。 */
export interface HaruyukiApi {
  getStatus(): Promise<ServerStatus>;
  listAgents(): Promise<AgentSummary[]>;
  listConversations(agentId?: string): Promise<ConversationSummary[]>;
  /**
   * 按**标题**搜会话（服务端原生过滤，`summary_search`）。
   *
   * ⚠️ 这里是**而非**"拉全量再本地筛"：服务端支持参数化过滤，本地筛会在会话多时退化。
   *
   * ⚠️ 搜的是 **`summary`，也就是"自定义标题"** —— 服务端匹配 `id` 与 `summary`
   * 两个字段（`local-conversation-list.ts`）。所以：
   * - 想搜到，**得先给会话改名**（P1 第 3 项做的就是这件事）
   * - **正文内容搜不到** —— 那是 recall 的领域（`recall now` 走 transcript 索引）
   *
   * 只返回匹配项，不做标题补全（那是逐会话再请求，对搜索结果没必要）。
   */
  searchConversations(agentId: string, query: string): Promise<ConversationSummary[]>;
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
   * recall 试搜（spawn `haruyuki recall now <query>`）：在**所有会话的正文**与
   * **记忆文件**里搜，返回命中的片段（带会话 id / 消息 id / 时间）。
   *
   * 与 `searchConversations` 的分工必须说清楚，否则用户会以为其中一个坏了：
   * - `searchConversations` → 只搜**会话标题**（`summary`）
   * - `recallProbe` → 搜**正文与记忆**（transcript + memory 索引）
   *
   * ⚠️ 它**不是精确匹配**，是相关性检索（有分数下限），所以搜不到某个确切字串是正常的。
   * ⚠️ 会带 `--agent`：不带的话上游报 "A recall probe needs an active agent"（实测）。
   */
  recallProbe(query: string): Promise<RecallCommandResult>;
  /**
   * 改一个 recall 设置。**越界的值会被主进程直接拒绝、不会 spawn**（上游还有第二道校验）。
   *
   * ⚠️ 改完**不会立即生效**：`settingsManager` 在进程启动时读一次并缓存，所以必须
   * 调 `restartServer()` 换一个进程。调用方要负责把这个前提告诉用户。
   */
  recallSet(setting: RecallSettingValue): Promise<RecallCommandResult>;
  /**
   * 新建 agent（`agent_create`）。
   *
   * 实测：**只给 `name` 就够了** —— `AgentCreateParams` 全部字段可选，服务端会补上
   * 默认模型（本机实测得到 `deepseek/deepseek-v4-pro`）与默认工具集。
   *
   * 只收 `name` 是**刻意的范围限制**：模型、系统提示、工具集这些配置项数量很大，
   * 一个表单放不下，也不该在这轮硬塞进来。需要更多配置时，去 TUI 的 `/agents`。
   *
   * @returns 新 agent（供界面立刻选中）。
   */
  createAgent(name: string): Promise<AgentSummary>;
  /**
   * 给会话改名（`conversation_update { summary }`）。
   *
   * ⚠️ 改的是 **`summary`** 字段，不是某个 name —— 服务端没有会话名字段。
   * 而 `summary` 恰好是：① 我们界面标题的**首选来源**（`ConversationList` 优先用它，
   * 为空才回退到"从最早的真实用户发言推导"）；② 服务端**搜索会话时会匹配它**
   * （`local-conversation-list.ts` 里对 `conversation.summary` 做 includes）。
   * 所以改它就同时获得了"可读标题"和"可被搜到"。
   *
   * 传空字符串 = 清除自定义标题，界面会退回自动推导。
   */
  renameConversation(conversationId: string, summary: string): Promise<void>;
  /**
   * 列出 agent 的记忆文件（`list_memory`，只读）。
   *
   * ⚠️ 需要 `agent_id` —— 记忆是**按 agent** 存的。所以调用方要先确定当前 agent。
   */
  listMemory(agentId: string): Promise<MemorySnapshot>;
  /**
   * 读一个记忆文件的**原始内容**（`read_memory_file`，只读）。
   *
   * ⚠️ **与 `listMemory` 的 `content` 不是一回事**，这个区别决定了编辑能不能用：
   *
   * | 来源 | 内容 |
   * |---|---|
   * | `listMemory().files[].content` | **已剥掉 frontmatter 的正文** |
   * | 本方法 | **含 frontmatter 的完整原文** |
   *
   * 实测 `human.md`：磁盘 263 字符（frontmatter `---
name: Human
description: …
---`），
   * 而 `list_memory` 报的 `content` 只有 178 字符的正文。
   *
   * 后果：**编辑必须基于本方法的返回值**。若拿 `list_memory` 的正文去保存，写回的
   * 就是没有 frontmatter 的文件 —— 记忆校验会拒绝（实测报
   * `missing frontmatter (must start with ---)`），而且**文件仍会落到工作区**。
   */
  readMemoryFile(agentId: string, path: string): Promise<string>;
  /**
   * 写一个记忆文件（`write_memory_file`，**写操作，会自动提交**）。
   *
   * 服务端会拒绝逃逸出记忆根的路径，并且**每次写入都是一个 git 提交** ——
   * 所以一旦写错，可以用 `memoryHistory` 找回旧版本。
   */
  writeMemoryFile(
    agentId: string,
    path: string,
    content: string,
    commitMessage?: string,
  ): Promise<void>;
  /** 删一个记忆文件（`delete_memory_file`，**写操作**）。 */
  deleteMemoryFile(agentId: string, path: string, commitMessage?: string): Promise<void>;
  /** 一个记忆文件（或全部文件）的提交历史（`memory_history`）。 */
  memoryHistory(agentId: string, path?: string, limit?: number): Promise<MemoryCommit[]>;
  /** 列出可选模型（`list_models`）。 */
  listModels(): Promise<ModelCatalog>;
  /**
   * 切换当前会话的模型（`update_model`）。
   *
   * `modelId` 必须是 `listModels()` 返回的 `id`（它编码了模型与推理档位）。
   * ⚠️ 当前生效的模型**协议读不出来**（`conversation_retrieve` 里没有任何 model 字段，
   * 实测为空），所以界面只能显示"本次运行内我们设过的那个"，重启后回到未知。
   *
   * @returns 服务端实际应用的 `{ modelId, modelHandle, appliedTo }`。
   */
  setModel(modelId: string): Promise<{ modelId?: string; modelHandle?: string; appliedTo?: string }>;
  /** 读当前会话的工作目录（`get_cwd_map`）。 */
  getWorkingDirectory(): Promise<WorkingDirectorySummary | null>;
  /**
   * 切换当前会话的工作目录。
   *
   * 走 `input` 命令的 `payload.cwd` —— 与 `payload.mode`（权限模式）**同一条通道**，
   * 服务端会 `realpath` + `stat` 校验，并**刷新会话上下文**，所以下一轮 agent
   * 就知道新目录（git 信息等也会更新）。
   *
   * `applyToAll` 为 true 时改用 `set_boot_working_directory`（所有**没有覆盖**的会话）。
   *
   * @returns 切换后的实际目录。**失败会抛错**，绝不静默假装成功。
   */
  setWorkingDirectory(path: string, applyToAll?: boolean): Promise<WorkingDirectorySummary>;
  /** 列一层目录（用于目录选择器，同时可用于校验路径存在）。 */
  listDirectory(path: string): Promise<DirectoryListing>;
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
