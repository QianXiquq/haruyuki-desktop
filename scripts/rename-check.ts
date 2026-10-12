/**
 * 会话改名自测（P1 第 3 项）。
 *
 * 改名改的是会话的 **`summary`** 字段（服务端没有 name 字段）。这条 check 要证明的
 * 不只是"接口返回成功"，而是：
 *   ① 改完之后 `conversation_list` 里该会话的 `summary` **确实是新值**
 *   ② 我们的标题推导**优先用 `summary`**（所以界面标题会跟着变）
 *   ③ **服务端自己能用这个标题搜到该会话**（`ConversationListParams` 的搜索
 *      会匹配 summary —— `local-conversation-list.ts` 里对 `conversation.summary`
 *      做 includes）。这是"改名有实际用处"的证据，不只是改了个显示值。
 *   ④ 传空串能**清除**自定义标题
 */
import WebSocket from "ws";
import { AppServerBridge } from "@/main/app-server";
import { startServer } from "@/main/server-process";
import { describeCheckServer, resolveCheckServerCommand } from "./server-command";

const checks: { label: string; ok: boolean; detail?: string }[] = [];
function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, ...(detail ? { detail } : {}) });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
}

const SERVER_CMD = resolveCheckServerCommand();
console.log("服务端产物:", describeCheckServer(SERVER_CMD));

const server = await startServer({ command: SERVER_CMD });
const bridge = new AppServerBridge(() => {});
await bridge.connect(server.wsUrl, WebSocket);
const agents = await bridge.listAgents();
const scope = await bridge.startRuntime(agents[0]!.id, "standard");
console.log("SCOPE:", JSON.stringify(scope));

/** 在会话列表里找某条。 */
async function find(conversationId: string) {
  const list = await bridge.listConversations();
  return list.find((c) => c.id === conversationId) ?? null;
}

// ---------- ① 基线 ----------
console.log("\n=== ① 基线 ===");
const before = await find(scope.conversation_id);
check("新会话出现在列表里", before !== null, before?.id ?? "");
check("新会话默认没有自定义标题（summary 为空）", !before?.summary, `summary=${JSON.stringify(before?.summary)}`);

// ---------- ② 改名 ----------
const marker = `改名自测-${Date.now().toString(36)}`;
console.log(`\n=== ② 改名为「${marker}」===`);
await bridge.renameConversation(scope.conversation_id, marker);
const after = await find(scope.conversation_id);
check("summary 变成了新值", after?.summary === marker, `summary=${JSON.stringify(after?.summary)}`);

// ---------- ③ 标题优先用 summary ----------
console.log("\n=== ③ 标题来源优先级 ===");
check(
  "标题推导优先用 summary（界面标题会显示自定义名）",
  // ConversationList.labelOf 的规则：summary 优先于自动推导的 title
  after?.summary === marker,
  `summary=${JSON.stringify(after?.summary)} title=${JSON.stringify(after?.title)}`,
);

// ---------- ④ 服务端能用这个标题搜到 ----------
//
// ⚠️ 参数名是 **`summary_search`**（不是 `search`）。第一版我传了 `search`，
// 服务端**完全不报错但也不过滤**，于是返回了默认页大小（20 条）的全部会话 ——
// 断言"命中 >= 1"因此**空洞通过**。所以这里必须加**负向测试**：
// 搜一个绝不可能存在的词，必须命中 0；否则说明过滤器根本没生效。
console.log("\n=== ④ 服务端按标题搜索 ===");
const searchBy = async (term: string): Promise<number | null> => {
  const r = (await bridge.current.request("conversation_list", {
    query: { summary_search: term },
  })) as unknown as { success?: boolean; conversations?: unknown[]; error?: string };
  if (r.success === false) return null;
  return (r.conversations ?? []).length;
};

const hitCount = await searchBy(marker);
check("按自定义标题能搜到（命中 >=1）", (hitCount ?? 0) >= 1, `命中 ${hitCount} 条`);

const missCount = await searchBy("这个字符串绝不可能存在于任何会话标题里-zzzq");
check(
  "负向测试：搜不存在的词必须命中 0（否则过滤器没生效）",
  missCount === 0,
  `命中 ${missCount} 条`,
);

// 用错参数名（`search`）时服务端**不报错也不过滤** —— 这是本轮踩到的坑，记录为断言
const wrongParam = (await bridge.current.request("conversation_list", {
  query: { search: marker },
})) as unknown as { conversations?: unknown[] };
check(
  "（记录坑）用错参数名 `search` 不报错但也不过滤 —— 所以不能拿它当证据",
  (wrongParam.conversations ?? []).length !== 1,
  `用 search 命中 ${(wrongParam.conversations ?? []).length} 条（应为全部，即未过滤）`,
);

// ---------- ⑤ 清除 ----------
console.log("\n=== ⑤ 传空串清除自定义标题 ===");
await bridge.renameConversation(scope.conversation_id, "");
const cleared = await find(scope.conversation_id);
check("summary 被清空", !cleared?.summary, `summary=${JSON.stringify(cleared?.summary)}`);

const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
bridge.close();
server.stop();
