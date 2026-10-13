/**
 * 会话的**本地存储层**操作。
 *
 * ## 为什么这里直接动文件系统
 *
 * app-server 协议**没有删除会话的命令**。实测 `conversation_*` 只有：
 * compact / create / fork / list / messages_list / recompile / retrieve / titles / update
 * —— 没有 delete。SDK 里有 `delete()`，但协议没暴露。所以 GUI 和 TUI **都删不了**，
 * 只能直接动本地后端的目录。
 *
 * ## 两个实测得到的关键事实
 *
 * 1. **目录名 = `base64url("conversation:" + id)`，无 `=` 填充**。
 *    第一版我用了带填充的 `base64`，结果删的是一个**不存在的路径**，
 *    测试因此"看起来没问题"却什么也没验证。
 * 2. **服务端把会话缓存在内存里**（`local-store.ts` 用 `this.conversations.values()`），
 *    所以删完目录后**列表不会立刻变化** —— 必须重启 app-server 才生效。
 *    目录本身不会被重建（实测等 5 秒仍是删掉的状态）。
 *
 * ## 记忆不受影响
 *
 * MemFS 是**按 agent** 存的（`<storage>/memfs/<agent-id>/memory`），与会话无关。
 * 删会话**不会**碰记忆 —— 这是刻意的，用户明确不希望删记忆。
 */
import { existsSync, readdirSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

/** 本地后端的存储根。可用 `HARUYUKI_STORAGE_DIR` 覆盖（自测用）。 */
export function conversationStoreRoot(): string {
  const override = process.env.HARUYUKI_STORAGE_DIR?.trim();
  if (override) return join(override, "conversations");
  return join(homedir(), ".haruyuki", "lc-local-backend", "conversations");
}

/**
 * 会话 id → 磁盘目录名。
 *
 * ⚠️ 必须是 **base64url**（无填充）。用 `base64` 会在末尾多出 `=`，
 * 于是路径对不上、删除静默无效。
 */
export function conversationDirName(conversationId: string): string {
  return Buffer.from(`conversation:${conversationId}`).toString("base64url");
}

/** 目录名 → 会话 id（反解，用于自检）。 */
export function conversationIdFromDirName(dirName: string): string | null {
  try {
    const decoded = Buffer.from(dirName, "base64url").toString("utf8");
    const prefix = "conversation:";
    return decoded.startsWith(prefix) ? decoded.slice(prefix.length) : null;
  } catch {
    return null;
  }
}

export interface DeleteResult {
  conversationId: string;
  /** 是否真的删掉了一个目录。 */
  removed: boolean;
  /** 不存在的目录：通常表示"已经删过了"。 */
  alreadyGone: boolean;
}

/**
 * 删除一个会话的本地存储。
 *
 * 安全闸（缺一不可）：
 * 1. `conversationId` 必须非空、且不含路径分隔符与 `..`
 * 2. 解出的目录名必须能反解回**同一个 id**（防止编码歧义导致删错）
 * 3. 目标目录必须**确实位于存储根之下**（防目录穿越）
 */
export function deleteConversation(conversationId: string): DeleteResult {
  if (!conversationId || conversationId.includes("/") || conversationId.includes("\\") || conversationId.includes("..")) {
    throw new Error(`非法的会话 id：${JSON.stringify(conversationId)}`);
  }

  const root = conversationStoreRoot();
  const dirName = conversationDirName(conversationId);

  // 闸 ②：编码必须可逆 —— 否则说明这个 id 不该被直接拼成路径
  const roundTrip = conversationIdFromDirName(dirName);
  if (roundTrip !== conversationId) {
    throw new Error(`会话 id 编码校验失败：${conversationId} → ${dirName} → ${roundTrip}`);
  }

  const target = join(root, dirName);
  // 闸 ③：必须在存储根之下（用字符串前缀 + 分隔符，避免 /root2 命中 /root）
  const normalisedRoot = root.endsWith("/") ? root : `${root}/`;
  if (!target.startsWith(normalisedRoot)) {
    throw new Error(`拒绝删除存储根之外的路径：${target}`);
  }

  if (!existsSync(target)) {
    return { conversationId, removed: false, alreadyGone: true };
  }
  rmSync(target, { recursive: true, force: true });
  return { conversationId, removed: true, alreadyGone: false };
}

/** 磁盘上现存的全部会话 id（不含 `default` —— 它被列表硬编码排除）。 */
export function listStoredConversationIds(): string[] {
  const root = conversationStoreRoot();
  if (!existsSync(root)) return [];
  const ids: string[] = [];
  for (const name of readdirSync(root)) {
    const id = conversationIdFromDirName(name);
    if (id) ids.push(id);
  }
  return ids;
}

/**
 * **历史 token 消耗总和**（从磁盘读）。
 *
 * ## 为什么必须读磁盘
 *
 * 协议在 `conversation_messages_list` 里把 `assistant_message.usage` 整段丢掉了
 * （实测返回 `null`），而磁盘上 `messages.jsonl` 里**每条 assistant 消息都有完整 usage**：
 *
 * ```json
 * { "input": 508, "output": 402, "cacheRead": 24192, "cacheWrite": 0,
 *   "reasoning": 305, "totalTokens": 25102, "cost": { ... } }
 * ```
 * 所以"打开旧会话就显示历史消耗"只能靠直接读文件 —— 也是唯一可行的口径。
 *
 * ## 口径：用 `input + output`，**不是** `totalTokens`
 *
 * `totalTokens` 实测等于**当时的上下文规模**（`totalTokens ≈ input + cacheRead`），
 * 是快照而不是"本轮增量"。逐条累加它会把同一个上下文重复计很多次
 * （17 条消息就能把 25000 的上下文加成 40 万）。所以：
 *
 * - 消耗 = `input + output`（`reasoning` 已含在 `output` 里，不另加）
 * - `cacheRead` / `cacheWrite` 单独返回：它们**确实是成本**，但不该混进"新增输入"的
 *   口径里，否则"读一次缓存"和"真的重新处理一遍"就分不出来了
 *
 * 磁盘上还有 `usage.cost`（协议同样不下发）。这里**刻意只取 token** ——
 * 成本口径未确认，不擅自展示。
 */
export interface ConversationTokenTotals {
  conversationId: string;
  /** 输入 + 输出，逐条累加 —— 这就是"总和"的定义。 */
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  /** 命中缓存读取的输入（成本项，不计入 totalTokens）。 */
  cacheReadTokens: number;
  cacheWriteTokens: number;
  /** 磁盘上有多少条带 usage 的记录被算进去了。 */
  turns: number;
  /** assistant 消息总条数；与 `turns` 不等时说明**部分轮次缺用量**。 */
  assistantMessages: number;
}

/** 读某个会话的历史 token 总和。文件不存在时返回全 0（这是正常情况，不是错误）。 */
export function readConversationTokens(conversationId: string): ConversationTokenTotals {
  const empty: ConversationTokenTotals = {
    conversationId,
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    turns: 0,
    assistantMessages: 0,
  };
  const file = join(conversationStoreRoot(), conversationDirName(conversationId), "messages.jsonl");
  if (!existsSync(file)) return empty;

  let input = 0;
  let output = 0;
  let cacheRead = 0;
  let cacheWrite = 0;
  let turns = 0;
  let assistantMessages = 0;

  for (const raw of readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    let entry: { type?: unknown; message?: unknown };
    try {
      entry = JSON.parse(line) as { type?: unknown; message?: unknown };
    } catch {
      continue; // 半行 / 坏行：跳过，不让一行毁掉整个统计
    }
    if (entry.type !== "message") continue;
    const message = entry.message as Record<string, unknown> | undefined;
    if (!message || message.role !== "assistant") continue;
    assistantMessages += 1;
    const usage = message.usage as Record<string, unknown> | undefined;
    if (!usage || typeof usage !== "object") continue;
    const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
    input += num(usage.input);
    output += num(usage.output);
    cacheRead += num(usage.cacheRead);
    cacheWrite += num(usage.cacheWrite);
    turns += 1;
  }

  return {
    conversationId,
    totalTokens: input + output,
    inputTokens: input,
    outputTokens: output,
    cacheReadTokens: cacheRead,
    cacheWriteTokens: cacheWrite,
    turns,
    assistantMessages,
  };
}

/** 读某个会话的标题（`summary`），用于界面确认弹窗显示"你正在删哪个"。 */
export function readConversationSummary(conversationId: string): string | null {
  try {
    const file = join(conversationStoreRoot(), conversationDirName(conversationId), "conversation.json");
    if (!existsSync(file)) return null;
    const parsed = JSON.parse(readFileSync(file, "utf8")) as { summary?: unknown };
    return typeof parsed.summary === "string" && parsed.summary ? parsed.summary : null;
  } catch {
    return null;
  }
}
