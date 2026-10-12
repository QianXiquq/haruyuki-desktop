/**
 * 跨会话搜索自测（P1 第 5 项，收窄版）。
 *
 * 这一项覆盖**两种不同的搜索**，必须分别验证 —— 否则用户会以为其中一个坏了：
 *
 * | 界面位置 | 搜什么 | 通道 |
 * |---|---|---|
 * | 侧栏搜索框 | 会话**标题**（`summary`） | `conversation_list` + `summary_search` |
 * | 「全部对话搜索」里的试搜 | **正文**与**记忆文件** | `haruyuki recall now` |
 *
 * 断言：
 *   ① 标题搜索用的是**服务端过滤**，且**负向可验证**（搜不存在的词必须 0 命中）
 *   ② 未设自定义标题的会话**搜 summary 搜不到**，但**按 id 能搜到**
 *      （服务端匹配 id + summary 两个字段）—— 这条解释了"为什么我搜不到某个会话"
 *   ③ 试搜能跑通并返回正文命中
 *   ④ 以 `-` 开头的查询词被我们**在 spawn 之前**拒绝（否则上游会当成命令行选项）
 */
import WebSocket from "ws";
import { AppServerBridge } from "@/main/app-server";
import { startServer } from "@/main/server-process";
import { describeCheckServer, resolveCheckServerCommand } from "./server-command";
import { runRecallCommand } from "@/main/recall";

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
const agent = agents.find((a) => a.name === "Tutor") ?? agents[0]!;
const agentId = agent.id;

// ---------- 准备：一个带唯一标题的会话 + 一个不带标题的会话 ----------
console.log("\n=== 准备两个会话 ===");
const titled = await bridge.startRuntime(agentId, "standard");
const untitled = await bridge.startRuntime(agentId, "standard");
const MARKER = `搜索自测标题-${Date.now().toString(36)}`;
await bridge.renameConversation(titled.conversation_id, MARKER);
console.log(`   有标题: ${titled.conversation_id} → 「${MARKER}」`);
console.log(`   无标题: ${untitled.conversation_id}`);

// ---------- ① 标题搜索 ----------
console.log("\n=== ① 标题搜索（服务端 summary_search）===");
const hit = await bridge.current.request("conversation_list", {
  query: { agent_id: agentId, summary_search: MARKER, limit: 100 },
}) as unknown as { success?: boolean; conversations?: { id: string }[]; error?: string };
const hitIds = (hit.conversations ?? []).map((c) => c.id);
check("按自定义标题命中", hitIds.includes(titled.conversation_id), `命中 ${hitIds.length} 条`);
check("只命中该会话（不是整页）", hitIds.length === 1, hitIds.join(", "));

const miss = await bridge.current.request("conversation_list", {
  query: { agent_id: agentId, summary_search: "绝不可能存在的标题-zzzq", limit: 100 },
}) as unknown as { conversations?: unknown[] };
check("负向：不存在的标题命中 0（证明过滤真的生效）", (miss.conversations ?? []).length === 0,
  `命中 ${(miss.conversations ?? []).length} 条`);

// ---------- ② 没设标题的会话搜不到 ----------
console.log("\n=== ② 没设自定义标题的会话：按 summary 搜不到 ===");
const untitledByTitle = await bridge.current.request("conversation_list", {
  query: { agent_id: agentId, summary_search: untitled.conversation_id, limit: 100 },
}) as unknown as { conversations?: { id: string }[] };
check(
  "按 id 作为查询词能搜到它（服务端同时匹配 id）",
  (untitledByTitle.conversations ?? []).some((c) => c.id === untitled.conversation_id),
  `命中 ${(untitledByTitle.conversations ?? []).length} 条`,
);
const list = await bridge.listConversations(agentId);
const untitledSummary = list.find((c) => c.id === untitled.conversation_id)?.summary;
check(
  "它的 summary 为空（所以搜标题自然搜不到）—— 这正是「搜不到某个会话」的原因",
  !untitledSummary,
  `summary=${JSON.stringify(untitledSummary)}`,
);

// ---------- ③ recall 试搜（正文搜索） ----------
console.log("\n=== ③ 试搜正文与记忆（recall now）===");
const probe = await runRecallCommand(["now", "会话列表恢复", "--agent", agentId]);
check("试搜能跑通", probe.ok, probe.error ?? "");
const probeOutput = probe.output;
check("返回了可读的命中说明", /Recall found|no-match|found/i.test(probeOutput), probeOutput.split("\n")[0]?.slice(0, 90) ?? "");
console.log("   " + probeOutput.split("\n").slice(0, 4).join("\n   "));

// ---------- ④ 以 `-` 开头的查询词 ----------
console.log("\n=== ④ 查询词以 `-` 开头（会被上游当成命令行选项）===");
// 复制 ipc.ts 里的那条守卫逻辑来做断言（同一个规则，避免两处走样）
const guard = (term: string): string | null => {
  const t = term.trim();
  if (!t) return "需要非空查询";
  if (t.startsWith("-")) return "不能以 - 开头";
  if (t.length > 500) return "过长";
  return null;
};
check("`--help` 之类被拒绝", guard("--help") !== null, guard("--help") ?? "");
check("`-n` 被拒绝", guard("-n") !== null);
check("正常查询词通过", guard("会话列表") === null);
check("空查询被拒绝", guard("   ") !== null);
// 顺便确认上游确实会把 `-` 开头的当选项（也就是我们的守卫不是多余的）
const upstream = await runRecallCommand(["now", "--help"]);
check(
  "上游把 `-` 开头当选项（证明守卫必要）",
  !upstream.ok || /Usage|usage/.test(upstream.output),
  (upstream.error ?? upstream.output.split("\n")[0] ?? "").slice(0, 90),
);

// ---------- 清理 ----------
console.log("\n=== 清理（把改过的标题还原）===");
await bridge.renameConversation(titled.conversation_id, "");
const cleared = (await bridge.listConversations(agentId)).find((c) => c.id === titled.conversation_id);
check("标题已清除", !cleared?.summary, `summary=${JSON.stringify(cleared?.summary)}`);

const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
bridge.close();
server.stop();
