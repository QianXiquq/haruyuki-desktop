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
